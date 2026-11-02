const config = require('../config');
const { checkAndRunDueReminders } = require('../services/scheduler');
const { UnauthorizedError } = require('../errors/AppError');
const logger = require('../utils/logger');

const cronController = {
  async handleTrigger(req, res) {
    const token = req.query.secret || req.headers['x-cron-secret'] || (req.body && req.body.secret);

    if (config.cronSecret && token !== config.cronSecret) {
      throw new UnauthorizedError('Invalid cron secret token');
    }

    const force = req.query.force === 'true' || (req.body && req.body.force === true);

    logger.info(`Cron webhook triggered (force=${force}) at ${new Date().toISOString()}`);
    const results = await checkAndRunDueReminders(force);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      force,
      processedCount: results.length,
      results
    });
  }
};

module.exports = cronController;
