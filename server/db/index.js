const config = require('../config');
const jsonStore = require('./jsonStore');
const postgresStore = require('./postgres');

let isPostgres = false;

async function initDb() {
  if (config.databaseUrl) {
    try {
      console.log('Connecting to PostgreSQL database...');
      await postgresStore.init(config.databaseUrl);
      isPostgres = true;
      console.log('PostgreSQL connected and tables initialized.');

      // Check if fresh DB and migrate any existing local groups
      const existingInPg = await postgresStore.getGroups(config.databaseUrl);
      if (existingInPg.length === 0) {
        const localGroups = await jsonStore.getGroups();
        if (localGroups.length > 0) {
          console.log(`Migrating ${localGroups.length} existing circle(s) to PostgreSQL...`);
          for (const g of localGroups) {
            await postgresStore.createGroup(config.databaseUrl, g);
          }
          console.log('Migration to PostgreSQL completed.');
        }
      }
    } catch (err) {
      console.warn('Failed to connect to PostgreSQL. Falling back to local JSON store:', err.message);
      isPostgres = false;
    }
  } else {
    console.log('No DATABASE_URL provided. Using local JSON store (data/database.json).');
  }
}

const db = {
  initDb,
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

