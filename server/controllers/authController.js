// server/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/config');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { validateLogin, validateRegistration } = require('../utils/validators');

/**
 * Auth controller for handling authentication-related requests
 */
class AuthController {
  /**
   * User login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      const { error } = validateLogin({ email, password });
      if (error) {
        throw ApiError.badRequest(error.details[0].message);
      }
      
      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        throw ApiError.unauthorized('Invalid credentials');
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        throw ApiError.unauthorized('Account is inactive');
      }
      
      // Verify password
      const isPasswordValid = await User.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid credentials');
      }
      
      // Create and sign JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.app.jwtSecret,
        { expiresIn: config.app.jwtExpiresIn }
      );
      
      // Update last login time
      await User.updateLastLogin(user.id);
      
      // Log the login activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          user.id,
          'LOGIN',
          'user',
          user.id,
          JSON.stringify({ email: user.email }),
          req.ip
        ]
      );
      
      // Send response without password
      const { password_hash, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Register a new user (public route, if allowed)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async register(req, res, next) {
    try {
      // Check if public registration is allowed
      const settingResult = await db.query(
        "SELECT value FROM system_settings WHERE key = 'allow_public_registration'"
      );
      
      const allowPublicRegistration = settingResult.rows.length > 0
        ? settingResult.rows[0].value
        : false;
      
      if (!allowPublicRegistration) {
        throw ApiError.forbidden('Public registration is not allowed');
      }
      
      const userData = req.body;
      
      // Validate input
      const { error } = validateRegistration(userData);
      if (error) {
        throw ApiError.badRequest(error.details[0].message);
      }
      
      // Force new registrations to have 'viewer' role
      userData.role = 'viewer';
      
      // Create the user
      const user = await User.create(userData);
      
      // Create and sign JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.app.jwtSecret,
        { expiresIn: config.app.jwtExpiresIn }
      );
      
      // Log the registration activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          user.id,
          'REGISTER',
          'user',
          user.id,
          JSON.stringify({ email: user.email }),
          req.ip
        ]
      );
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get current user data (from token)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCurrentUser(req, res, next) {
    try {
      // User data is available from the auth middleware
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Logout the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async logout(req, res, next) {
    try {
      // Log the logout activity
      if (req.user && req.user.id) {
        await db.query(
          'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
          [
            req.user.id,
            'LOGOUT',
            'user',
            req.user.id,
            req.ip
          ]
        );
      }
      
      // Note: in a JWT-based auth system, we don't actually invalidate the token
      // The client should remove the token from storage
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw ApiError.badRequest('Email is required');
      }
      
      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal that the user doesn't exist
        return res.status(200).json({
          success: true,
          message: 'If your email is registered, you will receive password reset instructions'
        });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);
      
      // Store reset token with expiry (1 hour)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      
      await db.query(
        `UPDATE users 
         SET reset_token = $1, reset_token_expires = $2, updated_at = NOW() 
         WHERE id = $3`,
        [resetTokenHash, expiryDate, user.id]
      );
      
      // In a real application, send an email with the reset token
      // For now, we'll just log it
      console.log(`Reset token for ${email}: ${resetToken}`);
      
      res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive password reset instructions'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Reset password using token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async resetPassword(req, res, next) {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        throw ApiError.badRequest('Email, token, and new password are required');
      }
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user || !user.reset_token || !user.reset_token_expires) {
        throw ApiError.badRequest('Invalid or expired reset token');
      }
      
      // Check if token is expired
      const now = new Date();
      if (now > new Date(user.reset_token_expires)) {
        throw ApiError.badRequest('Reset token has expired');
      }
      
      // Verify token
      const isTokenValid = await bcrypt.compare(token, user.reset_token);
      if (!isTokenValid) {
        throw ApiError.badRequest('Invalid or expired reset token');
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      
      // Update password and clear reset token
      await db.query(
        `UPDATE users 
         SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() 
         WHERE id = $2`,
        [newPasswordHash, user.id]
      );
      
      // Log the password reset activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          user.id,
          'PASSWORD_RESET',
          'user',
          user.id,
          JSON.stringify({ email: user.email }),
          req.ip
        ]
      );
      
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Verify JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async verifyToken(req, res, next) {
    try {
      // The auth middleware already verified the token and attached the user
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create instance for route handlers
const authController = new AuthController();

// Export controller methods
module.exports = {
  login: authController.login,
  register: authController.register,
  getCurrentUser: authController.getCurrentUser,
  logout: authController.logout,
  requestPasswordReset: authController.requestPasswordReset,
  resetPassword: authController.resetPassword,
  verifyToken: authController.verifyToken
};