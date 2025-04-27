// server/models/User.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { ApiError } = require('../middleware/errorHandler');

/**
 * User model for database operations
 */
class User {
  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   */
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, name, email, role, status, last_login, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        throw ApiError.notFound('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object including password hash
   */
  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT id, name, email, password_hash, role, status, last_login FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async create(userData) {
    const { name, email, password, role = 'viewer', status = 'active' } = userData;
    
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw ApiError.badRequest('Email already registered');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      // Insert new user
      const result = await db.query(
        `INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING id, name, email, role, status, created_at`,
        [name, email, password_hash, role, status]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update user data
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  static async update(id, updates) {
    try {
      // Get existing user
      const user = await this.findById(id);
      
      // Build the update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      // Only update specified fields
      Object.keys(updates).forEach(field => {
        // Don't allow updating certain fields
        if (['id', 'created_at'].includes(field)) return;
        
        // Handle password separately
        if (field === 'password') {
          updateFields.push(`password_hash = $${paramIndex}`);
          values.push(bcrypt.hashSync(updates[field], 10));
        } else {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(updates[field]);
        }
        
        paramIndex++;
      });
      
      // Add updated_at
      updateFields.push(`updated_at = NOW()`);
      
      // If no fields to update
      if (updateFields.length === 0) {
        return user;
      }
      
      // Add user ID as the last parameter
      values.push(id);
      
      // Execute update
      const result = await db.query(
        `UPDATE users 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING id, name, email, role, status, last_login, updated_at`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success
   */
  static async delete(id) {
    try {
      // Check if user exists
      await this.findById(id);
      
      // Delete user
      await db.query('DELETE FROM users WHERE id = $1', [id]);
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get all users with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of users
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT id, name, email, role, status, last_login, created_at, updated_at 
        FROM users
      `;
      
      const queryParams = [];
      const conditions = [];
      
      // Apply filters if provided
      if (filters.role) {
        conditions.push(`role = $${queryParams.length + 1}`);
        queryParams.push(filters.role);
      }
      
      if (filters.status) {
        conditions.push(`status = $${queryParams.length + 1}`);
        queryParams.push(filters.status);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      // Add order by
      query += ' ORDER BY name';
      
      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update user's last login time
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success
   */
  static async updateLastLogin(id) {
    try {
      await db.query(
        'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
        [id]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Verify user password
   * @param {string} password - Plain password to verify
   * @param {string} hash - Password hash from database
   * @returns {Promise<boolean>} Is password valid
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;