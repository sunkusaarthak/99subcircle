const express = require('express');
const router = express.Router();
const db = require('../db');
const { processGroupReminder } = require('../services/scheduler');
const emailService = require('../services/emailService');
const { getPayerReminderTemplate, getAdminReminderTemplate } = require('../services/emailTemplates');

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await db.getGroups();
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single group
router.get('/:id', async (req, res) => {
  try {
    const group = await db.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create group
router.post('/', async (req, res) => {
  try {
    const { name, platform, amount, currency, billingDay, adminName, adminEmail, paymentDetails, members } = req.body;
    if (!name || !amount || !adminEmail) {
      return res.status(400).json({ success: false, error: 'Name, amount, and admin email are required' });
    }

    const group = await db.createGroup({
      name,
      platform: platform || 'Custom',
      amount: parseFloat(amount),
      currency: currency || '₹',
      billingDay: parseInt(billingDay, 10) || 1,
      adminName: adminName || 'Admin',
      adminEmail,
      paymentDetails: paymentDetails || '',
      members: members || [],
      currentPayerIndex: 0,
      lastBilledDate: null
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update group
router.put('/:id', async (req, res) => {
  try {
    const group = await db.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const updated = await db.updateGroup(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.deleteGroup(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Group not found' });
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Manually trigger reminder email now & advance rotation
router.post('/:id/trigger', async (req, res) => {
  try {
    const group = await db.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const result = await processGroupReminder(group, true); // force=true
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Advance rotation without sending email (e.g. manual payment confirmed)
router.post('/:id/advance', async (req, res) => {
  try {
    const group = await db.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const activeMembers = (group.members || []).filter(m => m.active !== false);
    if (activeMembers.length === 0) {
      return res.status(400).json({ success: false, error: 'No active members in group' });
    }

    const nextIndex = ((group.currentPayerIndex || 0) + 1) % activeMembers.length;
    const updated = await db.updateGroup(req.params.id, {
      currentPayerIndex: nextIndex
    });

    res.json({ success: true, data: updated, nextPayer: activeMembers[nextIndex] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Skip current payer to next
router.post('/:id/skip', async (req, res) => {
  try {
    const group = await db.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const activeMembers = (group.members || []).filter(m => m.active !== false);
    if (activeMembers.length === 0) {
      return res.status(400).json({ success: false, error: 'No active members in group' });
    }

    const nextIndex = ((group.currentPayerIndex || 0) + 1) % activeMembers.length;
    const updated = await db.updateGroup(req.params.id, {
      currentPayerIndex: nextIndex
    });

    res.json({ success: true, data: updated, skippedTo: activeMembers[nextIndex] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Preview email template for current payer
router.get('/:id/preview-email', async (req, res) => {
  try {
    const group = await db.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const activeMembers = (group.members || []).filter(m => m.active !== false);
    const payer = activeMembers[group.currentPayerIndex % (activeMembers.length || 1)] || { name: 'Member Name', email: 'member@example.com' };
    const now = new Date();
    const cycleMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dueDate = new Date(now.getFullYear(), now.getMonth(), group.billingDay).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });

    const html = getPayerReminderTemplate({
      groupName: group.name,
      platform: group.platform,
      amount: group.amount,
      currency: group.currency,
      payerName: payer.name,
      adminName: group.adminName,
      adminEmail: group.adminEmail,
      paymentDetails: group.paymentDetails,
      cycleMonth,
      dueDate
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

