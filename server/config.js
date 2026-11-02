require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * *', // Daily at 09:00 UTC
  cronSecret: process.env.CRON_SECRET || 'subscription-secret-token-123',
  databaseUrl: process.env.DATABASE_URL || null,
  
  // Email Configuration (Supports Gmail SMTP, Brevo, or generic SMTP)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail', // 'gmail', 'smtp', or 'mock'
    user: process.env.GMAIL_USER || process.env.SMTP_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE !== undefined 
      ? process.env.SMTP_SECURE === 'true' 
      : parseInt(process.env.SMTP_PORT || '465', 10) === 465,
    fromName: process.env.EMAIL_FROM_NAME || '99subcircle',
    fromEmail: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER || 'no-reply@subscriptions.local'
  }
};

