const app = require('./app');
const config = require('./config');
const db = require('./db');
const {
  initScheduler,
  stopScheduler,
  checkAndRunDueRemindersIfNeeded
} = require('./services/scheduler');
const logger = require('./utils/logger');

let server = null;

async function startServer() {
  try {
    // 1. Initialize Database Storage
    await db.initDb();

    // 2. Initialize In-App Cron Scheduler
    initScheduler();

    // 3. Run non-blocking startup reminder catch-up check
    checkAndRunDueRemindersIfNeeded().catch(err => {
      logger.error('Startup reminder check error:', err.message);
    });

    // 4. Start HTTP Server
    server = app.listen(config.port, () => {
      logger.info('====================================================');
      logger.info(`⚫ 99subcircle backend active on port ${config.port}`);
      logger.info(`🌐 Environment: ${config.nodeEnv}`);
      logger.info(`📡 Healthcheck: http://localhost:${config.port}/health`);
      logger.info(`🗄️ Database:    ${db.isPostgres() ? 'PostgreSQL (Cloud)' : 'Local JSON'}`);
      logger.info('====================================================');
    });
  } catch (err) {
    logger.error('Fatal error during application startup:', err);
    process.exit(1);
  }
}

// Graceful Shutdown Handler (12-Factor App & Cloud Container Lifecycle)
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  // Force shutdown if cleanup takes longer than 10 seconds
  const forceTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  try {
    // 1. Stop scheduler
    stopScheduler();

    // 2. Stop accepting new HTTP requests
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed to new connections.');
    }

    // 3. Drain and close database pool
    await db.closeDb();

    logger.info('Graceful shutdown complete. Exiting cleanly.');
    process.exit(0);
  } catch (err) {
    logger.error('Error encountered during graceful shutdown:', err);
    process.exit(1);
  }
}

// Process signal listeners
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Process-level unhandled exception guards
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Launch
startServer();
