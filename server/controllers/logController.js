const db = require('../db');

const logController = {
  async getLogs(req, res) {
    const groupId = req.query.groupId || null;
    const logs = await db.getLogs(groupId);
    res.json({ success: true, data: logs });
  }
};

module.exports = logController;
