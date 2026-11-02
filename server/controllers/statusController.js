const config = require('../config');
const emailService = require('../services/emailService');
const { checkAndRunDueRemindersIfNeeded } = require('../services/scheduler');
const logger = require('../utils/logger');

const statusController = {
  getHealth(req, res) {
    res.status(200).json({
      status: 'ok',
      app: '99subcircle',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime())
    });

    // Non-blocking background reminder check
    checkAndRunDueRemindersIfNeeded().catch(err => {
      logger.error('Background healthcheck reminder check error:', err.message);
    });
  },

  async getStatus(req, res) {
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
  },

  async sendTestEmail(req, res) {
    const { to } = req.body;
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
  }
};

module.exports = statusController;
