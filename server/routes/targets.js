// server/routes/targets.js

const express = require('express');
const router = express.Router();
const targetsController = require('../controllers/targetsController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

/**
 * @route GET /api/targets
 * @desc Get all targets with filtering
 * @access Private
 */
router.get('/', auth, targetsController.getAllTargets);

/**
 * @route GET /api/targets/active
 * @desc Get active targets for dashboard
 * @access Private
 */
router.get('/active', auth, targetsController.getActiveTargets);

/**
 * @route GET /api/targets/achievement
 * @desc Get target achievement statistics
 * @access Private
 */
router.get('/achievement', auth, targetsController.getAchievementStats);

/**
 * @route GET /api/targets/:id
 * @desc Get target by ID
 * @access Private
 */
router.get('/:id', auth, targetsController.getTargetById);

/**
 * @route POST /api/targets
 * @desc Create new target
 * @access Private (Admin, Manager only)
 */
router.post('/', auth, rbac('admin', 'manager'), targetsController.createTarget);

/**
 * @route PUT /api/targets/:id
 * @desc Update a target
 * @access Private (Admin, Manager only)
 */
router.put('/:id', auth, rbac('admin', 'manager'), targetsController.updateTarget);

/**
 * @route DELETE /api/targets/:id
 * @desc Delete a target
 * @access Private (Admin only)
 */
router.delete('/:id', auth, rbac('admin'), targetsController.deleteTarget);

/**
 * @route POST /api/targets/bulk
 * @desc Bulk update/create targets
 * @access Private (Admin, Manager only)
 */
router.post('/bulk', auth, rbac('admin', 'manager'), targetsController.bulkUpdateTargets);

module.exports = router;