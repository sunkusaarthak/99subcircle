const express = require('express');
const router = express.Router();

const groupRoutes = require('./groups');
const cronRoutes = require('./cron');
const logRoutes = require('./logs');
const statusController = require('../controllers/statusController');
const asyncHandler = require('../middleware/asyncHandler');
const { validateTestEmail } = require('../middleware/validator');
const { emailActionLimiter } = require('../middleware/rateLimiter');

// Health Check
router.get(['/health', '/api/health'], statusController.getHealth);

// Sub-routers
router.use('/groups', groupRoutes);
router.use('/cron', cronRoutes);
router.use('/logs', logRoutes);

// Status & Verification
router.get('/status', asyncHandler(statusController.getStatus));
router.post('/test-email', emailActionLimiter, validateTestEmail, asyncHandler(statusController.sendTestEmail));

module.exports = router;
