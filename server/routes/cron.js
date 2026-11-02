const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/trigger', asyncHandler(cronController.handleTrigger));
router.post('/trigger', asyncHandler(cronController.handleTrigger));

module.exports = router;
