const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const isHealthCheck = req.originalUrl === '/api/health' || req.originalUrl === '/health';

    // Skip periodic healthcheck pings to prevent log clutter unless status is error
    if (isHealthCheck && res.statusCode < 400) {
      return;
    }

    const logMsg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    if (res.statusCode >= 500) {
      logger.error(logMsg);
    } else if (res.statusCode >= 400) {
      logger.warn(logMsg);
    } else {
      logger.info(logMsg);
    }
  });

  next();
}

module.exports = requestLogger;
