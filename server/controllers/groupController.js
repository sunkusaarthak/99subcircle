const db = require('../db');
const { processGroupReminder } = require('../services/scheduler');
const { getPayerReminderTemplate } = require('../services/emailTemplates');
const {
  getCycleMonthName,
  formatDueDate,
  getActiveMembers,
  getCurrentAndNextPayer
} = require('../services/rotationService');
const { NotFoundError, ValidationError } = require('../errors/AppError');

const groupController = {
  async getAllGroups(req, res) {
    const groups = await db.getGroups();
    res.json({ success: true, data: groups });
  },

  async getGroupById(req, res) {
    const group = await db.getGroupById(req.params.id);
    if (!group) throw new NotFoundError('Circle not found');
    res.json({ success: true, data: group });
  },

  async createGroup(req, res) {
    const {
      name,
      platform,
      amount,
      currency,
      billingDay,
      adminName,
      adminEmail,
      paymentDetails,
      members
    } = req.body;

    const group = await db.createGroup({
      name,
      platform: platform || 'Custom',
      amount,
      currency: currency || '₹',
      billingDay: billingDay || 1,
      adminName: adminName || 'Admin',
      adminEmail,
      paymentDetails: paymentDetails || '',
      members: members || [],
      currentPayerIndex: 0,
      lastBilledDate: null
    });

    res.status(201).json({ success: true, data: group });
  },

  async updateGroup(req, res) {
    const existing = await db.getGroupById(req.params.id);
    if (!existing) throw new NotFoundError('Circle not found');

    const updated = await db.updateGroup(req.params.id, req.body);
    res.json({ success: true, data: updated });
  },

  async deleteGroup(req, res) {
    const deleted = await db.deleteGroup(req.params.id);
    if (!deleted) throw new NotFoundError('Circle not found');
    res.json({ success: true, message: 'Circle deleted successfully' });
  },

  async triggerReminder(req, res) {
    const group = await db.getGroupById(req.params.id);
    if (!group) throw new NotFoundError('Circle not found');

    const result = await processGroupReminder(group, true);
    res.json({ success: true, data: result });
  },

  async advanceRotation(req, res) {
    const group = await db.getGroupById(req.params.id);
    if (!group) throw new NotFoundError('Circle not found');

    const { activeMembers, nextIndex, nextPayer } = getCurrentAndNextPayer(group);
    if (activeMembers.length === 0) {
      throw new ValidationError('No active members in circle');
    }

    const updated = await db.updateGroup(req.params.id, {
      currentPayerIndex: nextIndex
    });

    res.json({
      success: true,
      data: updated,
      nextPayer
    });
  },

  async skipTurn(req, res) {
    const group = await db.getGroupById(req.params.id);
    if (!group) throw new NotFoundError('Circle not found');

    const { activeMembers, nextIndex, nextPayer } = getCurrentAndNextPayer(group);
    if (activeMembers.length === 0) {
      throw new ValidationError('No active members in circle');
    }

    const updated = await db.updateGroup(req.params.id, {
      currentPayerIndex: nextIndex
    });

    res.json({
      success: true,
      data: updated,
      skippedTo: nextPayer
    });
  },

  async previewEmail(req, res) {
    const group = await db.getGroupById(req.params.id);
    if (!group) throw new NotFoundError('Circle not found');

    const { payer } = getCurrentAndNextPayer(group);
    const resolvedPayer = payer || { name: 'Member Name', email: 'member@example.com' };
    const now = new Date();
    const cycleMonth = getCycleMonthName(now);
    const dueDate = formatDueDate(group.billingDay, now);

    const html = getPayerReminderTemplate({
      groupName: group.name,
      platform: group.platform,
      amount: group.amount,
      currency: group.currency,
      payerName: resolvedPayer.name,
      adminName: group.adminName,
      adminEmail: group.adminEmail,
      paymentDetails: group.paymentDetails,
      cycleMonth,
      dueDate
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
};

module.exports = groupController;
