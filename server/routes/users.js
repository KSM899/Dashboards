// server/routes/users.js

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

/**
 * @route GET /api/users
 * @desc Get all users (admin only)
 * @access Private (Admin only)
 */
router.get('/', auth, rbac('admin'), usersController.getAllUsers);

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', auth, usersController.getCurrentUser);

/**
 * @route POST /api/users/change-password
 * @desc Change password for current user
 * @access Private
 */
router.post('/change-password', auth, usersController.changePassword);

/**
 * @route GET /api/users/sales-rep-data
 * @desc Get sales data grouped by sales representative
 * @access Private (Admin, Manager only)
 */
router.get('/sales-rep-data', auth, rbac('admin', 'manager'), usersController.getSalesRepData);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (Self or Admin only)
 */
router.get('/:id', auth, usersController.getUserById);

/**
 * @route POST /api/users
 * @desc Create new user (admin only)
 * @access Private (Admin only)
 */
router.post('/', auth, rbac('admin'), usersController.createUser);

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Private (Self or Admin only)
 */
router.put('/:id', auth, usersController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user (admin only)
 * @access Private (Admin only)
 */
router.delete('/:id', auth, rbac('admin'), usersController.deleteUser);

/**
 * @route PUT /api/users/:id/status
 * @desc Activate/deactivate a user (admin only)
 * @access Private (Admin only)
 */
router.put('/:id/status', auth, rbac('admin'), usersController.toggleUserStatus);

/**
 * @route GET /api/users/:id/activity
 * @desc Get user activity logs
 * @access Private (Self or Admin only)
 */
router.get('/:id/activity', auth, usersController.getUserActivityLogs);

module.exports = router;