const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const asyncHandler = require('../middleware/asyncHandler');
const { validateCreateGroup, validateUpdateGroup } = require('../middleware/validator');
const { emailActionLimiter } = require('../middleware/rateLimiter');

// Circle CRUD routes
router.get('/', asyncHandler(groupController.getAllGroups));
router.get('/:id', asyncHandler(groupController.getGroupById));
router.post('/', validateCreateGroup, asyncHandler(groupController.createGroup));
router.put('/:id', validateUpdateGroup, asyncHandler(groupController.updateGroup));
router.delete('/:id', asyncHandler(groupController.deleteGroup));

// Circle Rotation Actions
router.post('/:id/trigger', emailActionLimiter, asyncHandler(groupController.triggerReminder));
router.post('/:id/advance', asyncHandler(groupController.advanceRotation));
router.post('/:id/skip', asyncHandler(groupController.skipTurn));
router.get('/:id/preview-email', asyncHandler(groupController.previewEmail));

module.exports = router;
