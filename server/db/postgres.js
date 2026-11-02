const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

let pool = null;

function getPool(databaseUrl) {
  if (!pool) {
    const isCloudDb = databaseUrl.includes('sslmode=') || 
                      databaseUrl.includes('aivencloud.com') || 
                      databaseUrl.includes('neon.tech') || 
                      databaseUrl.includes('supabase.co');

    // Strip ?sslmode=... from the URL so node-pg doesn't enforce strict CA verification on self-signed certs
    const cleanUrl = databaseUrl.split('?')[0];

    pool = new Pool({
      connectionString: cleanUrl,
      ssl: isCloudDb || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    // Handle idle connection errors gracefully without crashing the process
    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client:', err.message);
    });
  }
  return pool;
}

async function initPostgres(databaseUrl) {
  const p = getPool(databaseUrl);
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await p.query(schemaSql);
  logger.info('PostgreSQL schema initialized successfully.');
}

const postgresStore = {
  async init(databaseUrl) {
    await initPostgres(databaseUrl);
  },

  async close() {
    if (pool) {
      await pool.end();
      pool = null;
      logger.info('PostgreSQL connection pool drained and closed.');
    }
  },

  async getGroups(databaseUrl) {
    const p = getPool(databaseUrl);
    const res = await p.query('SELECT * FROM subscription_groups ORDER BY created_at DESC');
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      platform: row.platform,
      amount: parseFloat(row.amount),
      currency: row.currency,
      billingDay: row.billing_day,
      adminName: row.admin_name,
      adminEmail: row.admin_email,
      paymentDetails: row.payment_details,
      members: row.members,
      currentPayerIndex: row.current_payer_index,
      lastBilledDate: row.last_billed_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async getGroupById(databaseUrl, id) {
    const p = getPool(databaseUrl);
    const res = await p.query('SELECT * FROM subscription_groups WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      platform: row.platform,
      amount: parseFloat(row.amount),
      currency: row.currency,
      billingDay: row.billing_day,
      adminName: row.admin_name,
      adminEmail: row.admin_email,
      paymentDetails: row.payment_details,
      members: row.members,
      currentPayerIndex: row.current_payer_index,
      lastBilledDate: row.last_billed_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  async createGroup(databaseUrl, groupData) {
    const p = getPool(databaseUrl);
    const id = groupData.id || `grp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const query = `
      INSERT INTO subscription_groups 
      (id, name, platform, amount, currency, billing_day, admin_name, admin_email, payment_details, members, current_payer_index, last_billed_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      id,
      groupData.name,
      groupData.platform || 'Custom',
      groupData.amount,
      groupData.currency || '₹',
      groupData.billingDay || 1,
      groupData.adminName || 'Admin',
      groupData.adminEmail,
      groupData.paymentDetails || '',
      JSON.stringify(groupData.members || []),
      groupData.currentPayerIndex || 0,
      groupData.lastBilledDate || null
    ];
    const res = await p.query(query, values);
    return res.rows[0];
  },

  async updateGroup(databaseUrl, id, updates) {
    const p = getPool(databaseUrl);
    const current = await this.getGroupById(databaseUrl, id);
    if (!current) return null;

    const merged = { ...current, ...updates };
    const query = `
      UPDATE subscription_groups 
      SET name = $1, platform = $2, amount = $3, currency = $4, billing_day = $5,
          admin_name = $6, admin_email = $7, payment_details = $8, members = $9,
          current_payer_index = $10, last_billed_date = $11, updated_at = NOW()
      WHERE id = $12
      RETURNING *;
    `;
    const values = [
      merged.name,
      merged.platform,
      merged.amount,
      merged.currency,
      merged.billingDay,
      merged.adminName,
      merged.adminEmail,
      merged.paymentDetails,
      JSON.stringify(merged.members),
      merged.currentPayerIndex,
      merged.lastBilledDate,
      id
    ];
    const res = await p.query(query, values);
    return res.rows[0];
  },

  async deleteGroup(databaseUrl, id) {
    const p = getPool(databaseUrl);
    const res = await p.query('DELETE FROM subscription_groups WHERE id = $1', [id]);
    return res.rowCount > 0;
  },

  async addLog(databaseUrl, logData) {
    const p = getPool(databaseUrl);
    const id = logData.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const query = `
      INSERT INTO reminder_logs 
      (id, group_id, group_name, payer_name, payer_email, admin_email, amount, currency, status, cycle_month, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      id,
      logData.groupId,
      logData.groupName,
      logData.payerName,
      logData.payerEmail,
      logData.adminEmail,
      logData.amount,
      logData.currency,
      logData.status || 'SENT',
      logData.cycleMonth,
      logData.details || ''
    ];
    const res = await p.query(query, values);
    return res.rows[0];
  },

  async getLogs(databaseUrl, groupId = null) {
    const p = getPool(databaseUrl);
    let query = 'SELECT * FROM reminder_logs';
    const values = [];
    if (groupId) {
      query += ' WHERE group_id = $1';
      values.push(groupId);
    }
    query += ' ORDER BY sent_at DESC LIMIT 200';
    const res = await p.query(query, values);
    return res.rows.map(r => ({
      id: r.id,
      groupId: r.group_id,
      groupName: r.group_name,
      payerName: r.payer_name,
      payerEmail: r.payer_email,
      adminEmail: r.admin_email,
      amount: parseFloat(r.amount),
      currency: r.currency,
      sentAt: r.sent_at,
      status: r.status,
      cycleMonth: r.cycle_month,
      details: r.details
    }));
  }
};

module.exports = postgresStore;
