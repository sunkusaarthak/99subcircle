const cron = require('node-cron');
const db = require('../db');
const emailService = require('./emailService');
const config = require('../config');
const logger = require('../utils/logger');
const {
  getCycleMonthName,
  getYearMonthKey,
  formatDueDate,
  getCurrentAndNextPayer
} = require('./rotationService');

let scheduledTask = null;
let lastCheckTimestamp = 0;
const MIN_CHECK_INTERVAL_MS = 60 * 60 * 1000; // Throttle to at most once per hour

/**
 * Process a single group's monthly reminder and advance its rotation cycle.
 */
async function processGroupReminder(group, force = false) {
  const now = new Date();
  const currentKey = getYearMonthKey(now);
  const cycleMonth = getCycleMonthName(now);
  const dueDate = formatDueDate(group.billingDay, now);

  // If already billed this month and not forced, skip
  if (!force && group.lastBilledDate && group.lastBilledDate.startsWith(currentKey)) {
    return {
      groupId: group.id,
      groupName: group.name,
      skipped: true,
      reason: `Already billed for ${currentKey}`
    };
  }

  const { activeMembers, payer, nextPayer, nextIndex } = getCurrentAndNextPayer(group);
  if (activeMembers.length === 0) {
    return {
      groupId: group.id,
      groupName: group.name,
      skipped: true,
      reason: 'No active members in group'
    };
  }

  // Send reminder emails to payer and group admin
  const sendResults = await emailService.sendMonthlyReminders({
    group,
    payer,
    nextPayer,
    cycleMonth,
    dueDate
  });

  const status = sendResults.errors.length === 0 ? 'SENT' : 'PARTIAL_ERROR';
  const details = sendResults.errors.length > 0
    ? sendResults.errors.join('; ')
    : 'Successfully sent reminder emails';

  // Advance rotation
  await db.updateGroup(group.id, {
    currentPayerIndex: nextIndex,
    lastBilledDate: now.toISOString()
  });

  // Log in audit history
  await db.addLog({
    groupId: group.id,
    groupName: group.name,
    payerName: payer.name,
    payerEmail: payer.email,
    adminEmail: group.adminEmail,
    amount: group.amount,
    currency: group.currency,
    status: emailService.isConfigured() ? status : 'MOCK_SENT',
    cycleMonth,
    details
  });

  return {
    groupId: group.id,
    groupName: group.name,
    payer: payer.name,
    payerEmail: payer.email,
    nextPayer: nextPayer ? nextPayer.name : null,
    amount: `${group.currency}${group.amount}`,
    status,
    details
  };
}

/**
 * Check all groups and process those due today.
 */
async function checkAndRunDueReminders(forceAll = false) {
  const groups = await db.getGroups();
  const today = new Date().getDate();
  const results = [];

  for (const group of groups) {
    const isDue = forceAll || group.billingDay === today;
    if (isDue) {
      try {
        const result = await processGroupReminder(group, forceAll);
        results.push(result);
      } catch (err) {
        logger.error(`Error processing reminder for circle "${group.name}":`, err.message);
        results.push({
          groupId: group.id,
          groupName: group.name,
          error: err.message
        });
      }
    }
  }

  return results;
}

/**
 * Throttled internal check triggered by healthcheck ping or server boot.
 */
async function checkAndRunDueRemindersIfNeeded() {
  const now = Date.now();
  if (now - lastCheckTimestamp < MIN_CHECK_INTERVAL_MS) {
    return { skipped: true, reason: 'Checked recently' };
  }
  lastCheckTimestamp = now;
  logger.info('Executing internal due-reminders check...');
  try {
    const results = await checkAndRunDueReminders(false);
    logger.info(`Internal check completed. Evaluated ${results.length} circle(s).`);
    return { skipped: false, count: results.length, results };
  } catch (err) {
    logger.error('Error during internal reminder check:', err.message);
    return { error: err.message };
  }
}

/**
 * Start the internal cron scheduler.
 */
function initScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
  }
  logger.info(`Initializing cron scheduler with schedule: "${config.cronSchedule}"`);
  scheduledTask = cron.schedule(config.cronSchedule, async () => {
    logger.info('Running scheduled daily subscription reminder check...');
    try {
      const results = await checkAndRunDueReminders(false);
      logger.info(`Daily check completed. Processed ${results.length} group(s).`);
    } catch (err) {
      logger.error('Error during scheduled reminder check:', err.message);
    }
  });
}

/**
 * Stop scheduler gracefully during server shutdown.
 */
function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    logger.info('Cron scheduler stopped.');
  }
}

module.exports = {
  initScheduler,
  stopScheduler,
  processGroupReminder,
  checkAndRunDueReminders,
  checkAndRunDueRemindersIfNeeded
};
