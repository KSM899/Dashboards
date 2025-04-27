// server/controllers/usersController.js

const User = require('../models/User');
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

/**
 * Users controller for handling user-related requests
 */
class UsersController {
  /**
   * Get all users with filtering (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllUsers(req, res, next) {
    try {
      const filters = {
        role: req.query.role || null,
        status: req.query.status || null
      };
      
      const users = await User.getAll(filters);
      
      // Remove sensitive information
      const safeUsers = users.map(user => {
        const { password_hash, ...safeUser } = user;
        return safeUser;
      });
      
      res.status(200).json({
        success: true,
        data: safeUsers,
        count: safeUsers.length
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid user ID');
      }
      
      // Users can only access their own profile, unless they're admins
      if (id !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('You are not authorized to access this user profile');
      }
      
      const user = await User.findById(id);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create new user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createUser(req, res, next) {
    try {
      const userData = req.body;
      
      // Validate required fields
      const requiredFields = ['name', 'email', 'password', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw ApiError.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Create the user
      const user = await User.create(userData);
      
      // Log the activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.user.id,
          'CREATE',
          'user',
          user.id,
          JSON.stringify({ email: user.email, role: user.role }),
          req.ip
        ]
      );
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateUser(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid user ID');
      }
      
      // Users can only update their own profile, unless they're admins
      if (id !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('You are not authorized to update this user');
      }
      
      const updates = req.body;
      
      // Prevent non-admins from changing role
      if (updates.role && req.user.role !== 'admin') {
        throw ApiError.forbidden('Only administrators can change user roles');
      }
      
      // Update the user
      const updatedUser = await User.update(id, updates);
      
      // Log the activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.user.id,
          'UPDATE',
          'user',
          id,
          JSON.stringify({ id, updates: { ...updates, password: updates.password ? '[REDACTED]' : undefined } }),
          req.ip
        ]
      );
      
      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete a user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteUser(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid user ID');
      }
      
      // Prevent deleting yourself
      if (id === req.user.id) {
        throw ApiError.badRequest('You cannot delete your own account');
      }
      
      // Get user before deleting (for logging)
      const user = await User.findById(id);
      
      // Delete the user
      await User.delete(id);
      
      // Log the activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.user.id,
          'DELETE',
          'user',
          id,
          JSON.stringify({ id, email: user.email }),
          req.ip
        ]
      );
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Change password for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        throw ApiError.badRequest('Current password and new password are required');
      }
      
      // Get user with password hash
      const userResult = await db.query(
        'SELECT id, email, password_hash FROM users WHERE id = $1',
        [req.user.id]
      );
      
      if (userResult.rows.length === 0) {
        throw ApiError.notFound('User not found');
      }
      
      const user = userResult.rows[0];
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Current password is incorrect');
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      
      // Update password
      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, req.user.id]
      );
      
      // Log the activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.user.id,
          'PASSWORD_CHANGE',
          'user',
          req.user.id,
          JSON.stringify({ id: req.user.id }),
          req.ip
        ]
      );
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Activate/deactivate a user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async toggleUserStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid user ID');
      }
      
      // Prevent toggling your own status
      if (id === req.user.id) {
        throw ApiError.badRequest('You cannot change your own account status');
      }
      
      // Get current user status
      const userResult = await db.query(
        'SELECT status FROM users WHERE id = $1',
        [id]
      );
      
      if (userResult.rows.length === 0) {
        throw ApiError.notFound('User not found');
      }
      
      const currentStatus = userResult.rows[0].status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // Update status
      await db.query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
        [newStatus, id]
      );
      
      // Log the activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.user.id,
          'STATUS_CHANGE',
          'user',
          id,
          JSON.stringify({ id, status: newStatus }),
          req.ip
        ]
      );
      
      res.status(200).json({
        success: true,
        message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        status: newStatus
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get user activity logs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserActivityLogs(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid user ID');
      }
      
      // Users can only access their own logs, unless they're admins
      if (id !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('You are not authorized to access these logs');
      }
      
      // Get logs with pagination
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      
      const logsResult = await db.query(
        `SELECT 
          id, 
          action, 
          entity_type, 
          entity_id, 
          details, 
          ip_address, 
          created_at 
        FROM 
          activity_logs 
        WHERE 
          user_id = $1 
        ORDER BY 
          created_at DESC 
        LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );
      
      const countResult = await db.query(
        'SELECT COUNT(*) FROM activity_logs WHERE user_id = $1',
        [id]
      );
      
      res.status(200).json({
        success: true,
        data: logsResult.rows,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get sales data grouped by sales representative
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSalesRepData(req, res, next) {
    try {
      // Get query parameters for filtering
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
      
      // Build query conditions
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      
      if (startDate) {
        conditions.push(`s.date >= $${paramIndex++}`);
        values.push(startDate);
      }
      
      if (endDate) {
        conditions.push(`s.date <= $${paramIndex++}`);
        values.push(endDate);
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Query to get sales by representative
      const query = `
        SELECT 
          u.id,
          u.name,
          COUNT(s.invoice_id) as order_count,
          SUM(s.item_net) as total_sales
        FROM 
          users u
        LEFT JOIN 
          sales s ON u.id = s.sales_rep_id
        ${whereClause}
        WHERE 
          u.role = 'manager' OR u.role = 'viewer'
        GROUP BY 
          u.id, u.name
        ORDER BY 
          total_sales DESC
      `;
      
      const result = await db.query(query, values);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create instance for route handlers
const usersController = new UsersController();

// Export controller methods
module.exports = {
  getAllUsers: usersController.getAllUsers,
  getUserById: usersController.getUserById,
  createUser: usersController.createUser,
  updateUser: usersController.updateUser,
  deleteUser: usersController.deleteUser,
  getCurrentUser: usersController.getCurrentUser,
  changePassword: usersController.changePassword,
  toggleUserStatus: usersController.toggleUserStatus,
  getUserActivityLogs: usersController.getUserActivityLogs,
  getSalesRepData: usersController.getSalesRepData
};