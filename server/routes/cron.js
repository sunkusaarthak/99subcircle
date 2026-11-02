const express = require('express');
const router = express.Router();
const config = require('../config');
const { checkAndRunDueReminders } = require('../services/scheduler');

// Webhook endpoint for external cron ping (e.g. cron-job.org / GitHub Actions / UptimeRobot)
// Supports both GET and POST for maximum compatibility
const handleCronTrigger = async (req, res) => {
  const token = req.query.secret || req.headers['x-cron-secret'] || (req.body && req.body.secret);

  if (config.cronSecret && token !== config.cronSecret) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid cron secret token'
    });
  }

  const force = req.query.force === 'true' || (req.body && req.body.force === true);

  try {
    console.log(`⏰ Cron webhook triggered (force=${force}) at ${new Date().toISOString()}`);
    const results = await checkAndRunDueReminders(force);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      force,
      processedCount: results.length,
      results
    });
  } catch (err) {
    console.error('Error executing cron webhook:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

router.get('/trigger', handleCronTrigger);
router.post('/trigger', handleCronTrigger);

module.exports = router;

