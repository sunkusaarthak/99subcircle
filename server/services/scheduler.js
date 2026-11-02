const cron = require('node-cron');
const db = require('../db');
const emailService = require('./emailService');
const config = require('../config');

function getCycleMonthName(date = new Date()) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getYearMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDueDate(billingDay, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const due = new Date(year, month, billingDay);
  return due.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Process a single group's monthly reminder
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

  // Find active members
  const activeMembers = (group.members || []).filter(m => m.active !== false);
  if (activeMembers.length === 0) {
    return {
      groupId: group.id,
      groupName: group.name,
      skipped: true,
      reason: 'No active members in group'
    };
  }

  const currentIndex = (group.currentPayerIndex || 0) % activeMembers.length;
  const payer = activeMembers[currentIndex];
  const nextIndex = (currentIndex + 1) % activeMembers.length;
  const nextPayer = activeMembers[nextIndex];

  // Send emails
  const sendResults = await emailService.sendMonthlyReminders({
    group,
    payer,
    nextPayer,
    cycleMonth,
    dueDate
  });

  const status = sendResults.errors.length === 0 ? 'SENT' : 'PARTIAL_ERROR';
  const details = sendResults.errors.length > 0 ? sendResults.errors.join('; ') : 'Successfully sent reminder emails';

  // Advance rotation
  const updatedGroup = await db.updateGroup(group.id, {
    currentPayerIndex: nextIndex,
    lastBilledDate: now.toISOString()
  });

  // Log in history
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
    nextPayer: nextPayer.name,
    amount: `${group.currency}${group.amount}`,
    status,
    details
  };
}

/**
 * Check all groups and process those due today
 */
async function checkAndRunDueReminders(forceAll = false) {
  const groups = await db.getGroups();
  const today = new Date().getDate();
  const results = [];

  for (const group of groups) {
    // If forceAll is true, process regardless of billingDay
    // Otherwise check if today is the group's billing day
    const isDue = forceAll || group.billingDay === today;
    if (isDue) {
      try {
        const result = await processGroupReminder(group, forceAll);
        results.push(result);
      } catch (err) {
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

let lastCheckTimestamp = 0;
const MIN_CHECK_INTERVAL_MS = 60 * 60 * 1000; // Throttle to at most once per hour

/**
 * Throttled internal check triggered by healthcheck ping or server boot.
 * Keeps all execution, rotation, and reminder logic 100% internal.
 */
async function checkAndRunDueRemindersIfNeeded() {
  const now = Date.now();
  if (now - lastCheckTimestamp < MIN_CHECK_INTERVAL_MS) {
    return { skipped: true, reason: 'Checked recently' };
  }
  lastCheckTimestamp = now;
  console.log('🔄 Executing internal due-reminders check...');
  try {
    const results = await checkAndRunDueReminders(false);
    console.log(`Internal check completed. Processed ${results.length} circle(s).`);
    return { skipped: false, count: results.length, results };
  } catch (err) {
    console.error('Error during internal reminder check:', err.message);
    return { error: err.message };
  }
}

function initScheduler() {
  console.log(`⏰ Initializing cron scheduler with schedule: "${config.cronSchedule}"`);
  cron.schedule(config.cronSchedule, async () => {
    console.log('⏰ Running daily subscription reminder check...');
    try {
      const results = await checkAndRunDueReminders(false);
      console.log(`Daily check completed. Processed ${results.length} group(s).`);
    } catch (err) {
      console.error('Error during scheduled reminder check:', err);
    }
  });
}

module.exports = {
  initScheduler,
  processGroupReminder,
  checkAndRunDueReminders,
  checkAndRunDueRemindersIfNeeded
};

