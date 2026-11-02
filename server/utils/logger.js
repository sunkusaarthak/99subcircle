const config = require('../config');

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = config.nodeEnv === 'production' ? LEVELS.INFO : LEVELS.DEBUG;

function formatTimestamp() {
  return new Date().toISOString();
}

const logger = {
  debug(...args) {
    if (currentLevel <= LEVELS.DEBUG) {
      console.log(`[DEBUG] [${formatTimestamp()}]`, ...args);
    }
  },
  info(...args) {
    if (currentLevel <= LEVELS.INFO) {
      console.log(`[INFO]  [${formatTimestamp()}]`, ...args);
    }
  },
  warn(...args) {
    if (currentLevel <= LEVELS.WARN) {
      console.warn(`[WARN]  [${formatTimestamp()}]`, ...args);
    }
  },
  error(...args) {
    if (currentLevel <= LEVELS.ERROR) {
      console.error(`[ERROR] [${formatTimestamp()}]`, ...args);
    }
  }
};

module.exports = logger;
