// server/routes/settings.js

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

/**
 * User Settings Routes
 */

/**
 * @route GET /api/settings/user
 * @desc Get all user settings
 * @access Private
 */
router.get('/user', auth, settingsController.getUserSettings);

/**
 * @route GET /api/settings/user/:key
 * @desc Get a specific user setting
 * @access Private
 */
router.get('/user/:key', auth, settingsController.getUserSetting);

/**
 * @route PUT /api/settings/user/:key
 * @desc Update a specific user setting
 * @access Private
 */
router.put('/user/:key', auth, settingsController.updateUserSetting);

/**
 * @route PUT /api/settings/user
 * @desc Update multiple user settings
 * @access Private
 */
router.put('/user', auth, settingsController.updateUserSettings);

/**
 * @route DELETE /api/settings/user/:key
 * @desc Delete a user setting
 * @access Private
 */
router.delete('/user/:key', auth, settingsController.deleteUserSetting);

/**
 * Dashboard Settings Routes
 */

/**
 * @route GET /api/settings/dashboard
 * @desc Get dashboard settings
 * @access Private
 */
router.get('/dashboard', auth, settingsController.getDashboardSettings);

/**
 * @route PUT /api/settings/dashboard
 * @desc Update dashboard settings
 * @access Private
 */
router.put('/dashboard', auth, settingsController.updateDashboardSettings);

/**
 * @route POST /api/settings/dashboard/reset
 * @desc Reset dashboard settings to defaults
 * @access Private
 */
router.post('/dashboard/reset', auth, settingsController.resetDashboardSettings);

/**
 * System Settings Routes (Admin only)
 */

/**
 * @route GET /api/settings/system
 * @desc Get all system settings
 * @access Private (Admin only)
 */
router.get('/system', auth, rbac('admin'), settingsController.getSystemSettings);

/**
 * @route GET /api/settings/system/:key
 * @desc Get a specific system setting
 * @access Private (Admin only)
 */
router.get('/system/:key', auth, rbac('admin'), settingsController.getSystemSetting);

/**
 * @route PUT /api/settings/system/:key
 * @desc Update a specific system setting
 * @access Private (Admin only)
 */
router.put('/system/:key', auth, rbac('admin'), settingsController.updateSystemSetting);

/**
 * @route PUT /api/settings/system
 * @desc Update multiple system settings
 * @access Private (Admin only)
 */
router.put('/system', auth, rbac('admin'), settingsController.updateSystemSettings);

/**
 * @route DELETE /api/settings/system/:key
 * @desc Delete a system setting
 * @access Private (Admin only)
 */
router.delete('/system/:key', auth, rbac('admin'), settingsController.deleteSystemSetting);

module.exports = router;