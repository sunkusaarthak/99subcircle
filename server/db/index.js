const config = require('../config');
const jsonStore = require('./jsonStore');
const postgresStore = require('./postgres');
const logger = require('../utils/logger');

let isPostgres = false;

async function initDb() {
  if (config.databaseUrl) {
    try {
      logger.info('Connecting to PostgreSQL database...');
      await postgresStore.init(config.databaseUrl);
      isPostgres = true;
      logger.info('PostgreSQL connected and tables initialized.');

      // Check if fresh DB and migrate any existing local groups
      const existingInPg = await postgresStore.getGroups(config.databaseUrl);
      if (existingInPg.length === 0) {
        const localGroups = await jsonStore.getGroups();
        if (localGroups.length > 0) {
          logger.info(`Migrating ${localGroups.length} existing circle(s) to PostgreSQL...`);
          for (const g of localGroups) {
            await postgresStore.createGroup(config.databaseUrl, g);
          }
          logger.info('Migration to PostgreSQL completed.');
        }
      }
    } catch (err) {
      logger.warn('Failed to connect to PostgreSQL. Falling back to local JSON store:', err.message);
      isPostgres = false;
    }
  } else {
    logger.info('No DATABASE_URL provided. Using local JSON store (data/database.json).');
  }
}

async function closeDb() {
  if (isPostgres) {
    await postgresStore.close();
  }
}

const db = {
  initDb,
  closeDb,
  isPostgres: () => isPostgres,
  async getGroups() {
    return isPostgres ? postgresStore.getGroups(config.databaseUrl) : jsonStore.getGroups();
  },
  async getGroupById(id) {
    return isPostgres ? postgresStore.getGroupById(config.databaseUrl, id) : jsonStore.getGroupById(id);
  },
  async createGroup(data) {
    return isPostgres ? postgresStore.createGroup(config.databaseUrl, data) : jsonStore.createGroup(data);
  },
  async updateGroup(id, updates) {
    return isPostgres ? postgresStore.updateGroup(config.databaseUrl, id, updates) : jsonStore.updateGroup(id, updates);
  },
  async deleteGroup(id) {
    return isPostgres ? postgresStore.deleteGroup(config.databaseUrl, id) : jsonStore.deleteGroup(id);
  },
  async addLog(log) {
    return isPostgres ? postgresStore.addLog(config.databaseUrl, log) : jsonStore.addLog(log);
  },
  async getLogs(groupId = null) {
    return isPostgres ? postgresStore.getLogs(config.databaseUrl, groupId) : jsonStore.getLogs(groupId);
  }
};

module.exports = db;
