const logger = require('../utils/logger');
const config = require('../config');

function errorHandler(err, req, res, next) {
  // Catch bad JSON in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload in request body'
    });
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error with context
  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.originalUrl}] 500 Internal Error:`, err.stack || err.message);
  } else {
    logger.warn(`[${req.method} ${req.originalUrl}] ${statusCode} Client Error:`, err.message);
  }

  // Consistent API error format
  const response = {
    success: false,
    error: isOperational || config.nodeEnv !== 'production' ? err.message : 'An internal server error occurred'
  };

  if (err.details) {
    response.details = err.details;
  }

  if (config.nodeEnv !== 'production' && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
