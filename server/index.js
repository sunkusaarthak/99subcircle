const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./db');
const { initScheduler, checkAndRunDueRemindersIfNeeded } = require('./services/scheduler');
const emailService = require('./services/emailService');

const groupRoutes = require('./routes/groups');
const cronRoutes = require('./routes/cron');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Pure Healthcheck Endpoint
// External cron / uptime monitor pings this to wake or keep the app alive.
// All reminder logic, calculations, and email triggers run 100% internally.
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: '99subcircle',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });

  // Non-blocking internal background check:
  // Evaluates whether any circles are due today and haven't been billed yet
  checkAndRunDueRemindersIfNeeded().catch(err => {
    console.error('Background healthcheck reminder check error:', err.message);
  });
});

// API Routes
app.use('/api/groups', groupRoutes);
app.use('/api/cron', cronRoutes);

// Get audit logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await db.getLogs(req.query.groupId || null);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// App & Email Service Status Check
app.get('/api/status', async (req, res) => {
  try {
    const emailStatus = await emailService.verifyConnection();
    res.json({
      success: true,
      email: {
        configured: emailService.isConfigured(),
        mode: emailStatus.mode,
        host: config.email.host,
        user: config.email.user ? config.email.user.replace(/(?<=.{3}).(?=.*@)/g, '*') : null,
        message: emailStatus.message
      },
      scheduler: {
        mode: 'internal',
        schedule: config.cronSchedule,
        healthEndpoint: '/api/health'
      },
      database: config.databaseUrl ? 'PostgreSQL' : 'Local JSON Store'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send test email
app.post('/api/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient "to" email is required' });
    }

    const testResult = await emailService.sendEmail({
      to,
      subject: '99subcircle — Verification Test Email',
      html: `
        <div style="font-family:-apple-system, BlinkMacSystemFont, sans-serif; max-width:480px; margin:0 auto; padding:28px 24px; border:1px solid #e4e4e7; border-radius:12px; background:#ffffff;">
          <div style="font-family:monospace; font-size:14px; font-weight:700; color:#09090b; margin-bottom:16px;">99subcircle</div>
          <h2 style="color:#09090b; font-size:18px; margin:0 0 10px 0; font-weight:600;">SMTP Verification Succeeded</h2>
          <p style="color:#52525b; font-size:14px; line-height:1.5;">Your email dispatch service is active and ready to deliver monthly circle rotation notices.</p>
          <div style="font-family:monospace; color:#a1a1aa; font-size:11px; margin-top:20px; border-top:1px solid #f4f4f5; padding-top:12px;">Timestamp: ${new Date().toISOString()}</div>
        </div>
      `,
      text: '99subcircle test email successful.'
    });

    res.json({ success: true, data: testResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  // If it's an API route that reached here, 404 it
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  // Otherwise send index.html if frontend is built
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>Subscription Mailer API is running! 🚀</h2>
          <p>Frontend is currently running in development mode or needs building.</p>
          <p>Run <code>npm run build</code> to compile the client, or run <code>npm run client</code> for local React Vite dev server.</p>
        </div>
      `);
    }
  });
});

// Start Server
async function start() {
  await db.initDb();
  initScheduler();

  // Run initial check on server startup / wakeup from cold start
  checkAndRunDueRemindersIfNeeded().catch(err => {
    console.error('Startup reminder check error:', err.message);
  });

  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`⚫ 99subcircle running on port ${config.port}`);
    console.log(`🌐 Environment: ${config.nodeEnv}`);
    console.log(`📡 Healthcheck: http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

