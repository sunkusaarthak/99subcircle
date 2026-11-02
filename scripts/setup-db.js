const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  // Strip query parameters so pg-pool does not enforce strict CA verification on self-signed cloud certs
  const cleanUrl = dbUrl.split('?')[0];
  console.log(`📡 Connecting to PostgreSQL at ${cleanUrl.replace(/:[^:@]*@/, ':***@')}...`);

  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const timeRes = await pool.query('SELECT NOW()');
    console.log(`✅ Connection established! Server time: ${timeRes.rows[0].now}`);

    const schemaPath = path.join(__dirname, '../server/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📦 Creating tables and indexes from schema.sql...');
    await pool.query(schemaSql);
    console.log('✅ Tables and indexes created successfully!');

    // Check existing tables
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Active tables in public schema:');
    tablesRes.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    // Check if subscription_groups has any rows; if 0, seed default circle
    const countRes = await pool.query('SELECT COUNT(*) FROM subscription_groups');
    console.log(`\n📊 Current circles count: ${countRes.rows[0].count}`);

    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial demo circle into subscription_groups...');
      const seedQuery = `
        INSERT INTO subscription_groups 
        (id, name, platform, amount, currency, billing_day, admin_name, admin_email, payment_details, members, current_payer_index, last_billed_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `;
      const members = [
        { id: 'mem_1', name: 'Alex Johnson', email: 'alex@example.com', active: true, order: 0 },
        { id: 'mem_2', name: 'Priya Sharma', email: 'priya@example.com', active: true, order: 1 },
        { id: 'mem_3', name: 'David Miller', email: 'david@example.com', active: true, order: 2 },
        { id: 'mem_4', name: 'Ananya Patel', email: 'ananya@example.com', active: true, order: 3 }
      ];
      await pool.query(seedQuery, [
        'grp_youtube_demo',
        'Family YouTube Premium',
        'YouTube Premium',
        299.00,
        '₹',
        5,
        'Sarthak (Host)',
        process.env.GMAIL_USER || 'admin@example.com',
        'UPI ID: admin@okhdfcbank or GPay to +91 9876543210',
        JSON.stringify(members),
        0,
        null
      ]);
      console.log('✅ Demo circle seeded successfully.');
    }

    console.log('\n🎉 Database setup complete and verified!');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();

