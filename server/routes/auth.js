// server/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/register
 * @desc Register a new user (if public registration is allowed)
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route GET /api/auth/me
 * @desc Get current user data from token
 * @access Private
 */
router.get('/me', auth, authController.getCurrentUser);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client removes token, server logs the action)
 * @access Private
 */
router.post('/logout', auth, authController.logout);

/**
 * @route POST /api/auth/password/request-reset
 * @desc Request password reset (generates token and sends email)
 * @access Public
 */
router.post('/password/request-reset', authController.requestPasswordReset);

/**
 * @route POST /api/auth/password/reset
 * @desc Reset password using token received by email
 * @access Public
 */
router.post('/password/reset', authController.resetPassword);

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token validity
 * @access Private
 */
router.get('/verify', auth, authController.verifyToken);

module.exports = router;