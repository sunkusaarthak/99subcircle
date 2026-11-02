const nodemailer = require('nodemailer');
const config = require('../config');
const { getPayerReminderTemplate, getAdminReminderTemplate } = require('./emailTemplates');

let transporter = null;
let cachedVerifyResult = null;
let lastVerifyTime = 0;

function createTransporter() {
  const { user, pass, host, port, secure } = config.email;

  // Check if credentials exist
  if (!user || !pass) {
    console.log('ℹ️  No email credentials (GMAIL_USER / GMAIL_APP_PASSWORD) configured.');
    console.log('    Email service running in Mock/Preview mode.');
    return null;
  }

  const cleanUser = user.trim();
  const cleanPass = pass.replace(/\s+/g, '');

  try {
    // If using Gmail, use nodemailer's built-in 'gmail' service profile
    if (config.email.service === 'gmail' || (host && host.includes('gmail.com'))) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cleanUser,
          pass: cleanPass
        }
      });
    }

    // Generic SMTP fallback (Brevo, custom SMTP, etc.)
    const transportOptions = {
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    };

    return nodemailer.createTransport(transportOptions);
  } catch (err) {
    console.error('Failed to initialize nodemailer transporter:', err.message);
    return null;
  }
}

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

const emailService = {
  isConfigured() {
    return Boolean(config.email.user && config.email.pass);
  },

  async verifyConnection(force = false) {
    const t = getTransporter();
    if (!t) {
      return { ok: false, mode: 'mock', message: 'No email credentials configured. Running in Mock/Preview mode.' };
    }

    const now = Date.now();
    // Use cached verification for 15 minutes to eliminate latency and avoid blocking requests
    if (!force && cachedVerifyResult && (now - lastVerifyTime < 15 * 60 * 1000)) {
      return cachedVerifyResult;
    }

    try {
      // 3.5s timeout race so verify never stalls the status API response
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP connection check timed out')), 3500)
      );
      await Promise.race([t.verify(), timeoutPromise]);

      cachedVerifyResult = {
        ok: true,
        mode: 'live',
        message: `Connected to SMTP server (${config.email.host}) as ${config.email.user}`
      };
      lastVerifyTime = now;
      return cachedVerifyResult;
    } catch (err) {
      if (cachedVerifyResult && cachedVerifyResult.ok) {
        return cachedVerifyResult;
      }
      return { ok: false, mode: 'live-unverified', message: `SMTP check notice: ${err.message}` };
    }
  },

  async sendEmail({ to, subject, html, text }) {
    const t = getTransporter();
    const fromAddress = `"${config.email.fromName}" <${config.email.fromEmail}>`;

    if (!t) {
      console.log('--------------------------------------------------');
      console.log('📧 [MOCK EMAIL SIMULATION]');
      console.log(`From:    ${fromAddress}`);
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('Status:  Delivered (Mock Mode)');
      console.log('--------------------------------------------------');
      return {
        success: true,
        mock: true,
        messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      };
    }

    try {
      const info = await t.sendMail({
        from: fromAddress,
        to,
        subject,
        text: text || 'Please view this email in an HTML-compatible client.',
        html
      });
      console.log(`Email successfully sent to ${to}: ${info.messageId}`);
      return {
        success: true,
        mock: false,
        messageId: info.messageId
      };
    } catch (err) {
      console.error(`Failed to send email to ${to}:`, err.message);
      throw err;
    }
  },

  async sendMonthlyReminders({ group, payer, nextPayer, cycleMonth, dueDate }) {
    const payerHtml = getPayerReminderTemplate({
      groupName: group.name,
      platform: group.platform,
      amount: group.amount,
      currency: group.currency,
      payerName: payer.name,
      adminName: group.adminName,
      adminEmail: group.adminEmail,
      paymentDetails: group.paymentDetails,
      cycleMonth,
      dueDate
    });

    const adminHtml = getAdminReminderTemplate({
      groupName: group.name,
      platform: group.platform,
      amount: group.amount,
      currency: group.currency,
      payerName: payer.name,
      payerEmail: payer.email,
      cycleMonth,
      dueDate,
      nextPayerName: nextPayer ? `${nextPayer.name} (${nextPayer.email})` : null
    });

    const results = {
      payerResult: null,
      adminResult: null,
      errors: []
    };

    // 1. Send to responsible payer
    try {
      const payerRes = await this.sendEmail({
        to: payer.email,
        subject: `[Reminder] Your turn to pay ${group.currency}${group.amount} for ${group.name} (${cycleMonth})`,
        html: payerHtml
      });
      results.payerResult = payerRes;
    } catch (err) {
      results.errors.push(`Payer email error: ${err.message}`);
    }

    // 2. Send to Admin (if admin email is different or even if same, notify admin)
    try {
      const adminRes = await this.sendEmail({
        to: group.adminEmail,
        subject: `[Admin Notice] Billing reminder sent to ${payer.name} for ${group.name} (${cycleMonth})`,
        html: adminHtml
      });
      results.adminResult = adminRes;
    } catch (err) {
      results.errors.push(`Admin email error: ${err.message}`);
    }

    return results;
  }
};

module.exports = emailService;
