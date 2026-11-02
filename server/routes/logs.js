const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(logController.getLogs));

module.exports = router;
