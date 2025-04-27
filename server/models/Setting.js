// server/models/Setting.js

const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Setting model for database operations
 */
class Setting {
  /**
   * Get user settings
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User settings
   */
  static async getUserSettings(userId) {
    try {
      const query = `
        SELECT 
          user_id,
          setting_key,
          setting_value,
          created_at,
          updated_at
        FROM 
          settings
        WHERE 
          user_id = $1
      `;
      
      const result = await db.query(query, [userId]);
      
      // Convert to object format
      const settings = {};
      result.rows.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });
      
      return settings;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get a specific user setting
   * @param {number} userId - User ID
   * @param {string} key - Setting key
   * @returns {Promise<Object>} Setting value
   */
  static async getUserSetting(userId, key) {
    try {
      const query = `
        SELECT 
          setting_value
        FROM 
          settings
        WHERE 
          user_id = $1 AND setting_key = $2
      `;
      
      const result = await db.query(query, [userId, key]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].setting_value;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update or create a user setting
   * @param {number} userId - User ID
   * @param {string} key - Setting key
   * @param {Object} value - Setting value (will be stored as JSON)
   * @returns {Promise<boolean>} Success
   */
  static async setUserSetting(userId, key, value) {
    try {
      // Check if setting exists
      const existsQuery = `
        SELECT 1 FROM settings
        WHERE user_id = $1 AND setting_key = $2
      `;
      
      const existsResult = await db.query(existsQuery, [userId, key]);
      const exists = existsResult.rows.length > 0;
      
      if (exists) {
        // Update existing setting
        const updateQuery = `
          UPDATE settings
          SET setting_value = $1, updated_at = NOW()
          WHERE user_id = $2 AND setting_key = $3
        `;
        
        await db.query(updateQuery, [value, userId, key]);
      } else {
        // Create new setting
        const insertQuery = `
          INSERT INTO settings (user_id, setting_key, setting_value, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `;
        
        await db.query(insertQuery, [userId, key, value]);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update multiple user settings at once
   * @param {number} userId - User ID
   * @param {Object} settings - Object with key-value pairs
   * @returns {Promise<boolean>} Success
   */
  static async updateUserSettings(userId, settings) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      for (const [key, value] of Object.entries(settings)) {
        // Skip null or undefined values
        if (value === null || value === undefined) continue;
        
        // Check if setting exists
        const existsQuery = `
          SELECT 1 FROM settings
          WHERE user_id = $1 AND setting_key = $2
        `;
        
        const existsResult = await client.query(existsQuery, [userId, key]);
        const exists = existsResult.rows.length > 0;
        
        if (exists) {
          // Update existing setting
          const updateQuery = `
            UPDATE settings
            SET setting_value = $1, updated_at = NOW()
            WHERE user_id = $2 AND setting_key = $3
          `;
          
          await client.query(updateQuery, [value, userId, key]);
        } else {
          // Create new setting
          const insertQuery = `
            INSERT INTO settings (user_id, setting_key, setting_value, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `;
          
          await client.query(insertQuery, [userId, key, value]);
        }
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Database error: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Delete a user setting
   * @param {number} userId - User ID
   * @param {string} key - Setting key
   * @returns {Promise<boolean>} Success
   */
  static async deleteUserSetting(userId, key) {
    try {
      const query = `
        DELETE FROM settings
        WHERE user_id = $1 AND setting_key = $2
      `;
      
      await db.query(query, [userId, key]);
      return true;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Delete all settings for a user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success
   */
  static async deleteAllUserSettings(userId) {
    try {
      const query = `
        DELETE FROM settings
        WHERE user_id = $1
      `;
      
      await db.query(query, [userId]);
      return true;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get system-wide settings
   * @returns {Promise<Object>} System settings
   */
  static async getSystemSettings() {
    try {
      const query = `
        SELECT 
          key,
          value,
          description
        FROM 
          system_settings
      `;
      
      const result = await db.query(query);
      
      // Convert to object format
      const settings = {};
      result.rows.forEach(row => {
        settings[row.key] = row.value;
      });
      
      return settings;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get a specific system setting
   * @param {string} key - Setting key
   * @returns {Promise<Object>} Setting value
   */
  static async getSystemSetting(key) {
    try {
      const query = `
        SELECT 
          value
        FROM 
          system_settings
        WHERE 
          key = $1
      `;
      
      const result = await db.query(query, [key]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].value;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update or create a system setting
   * @param {string} key - Setting key
   * @param {Object} value - Setting value (will be stored as JSON)
   * @param {string} description - Optional description
   * @param {number} modifiedBy - User ID who modified the setting
   * @returns {Promise<boolean>} Success
   */
  static async setSystemSetting(key, value, description = null, modifiedBy = null) {
    try {
      // Check if setting exists
      const existsQuery = `
        SELECT 1 FROM system_settings
        WHERE key = $1
      `;
      
      const existsResult = await db.query(existsQuery, [key]);
      const exists = existsResult.rows.length > 0;
      
      if (exists) {
        // Update existing setting
        const updateQuery = `
          UPDATE system_settings
          SET value = $1, description = COALESCE($2, description), modified_by = $3, updated_at = NOW()
          WHERE key = $4
        `;
        
        await db.query(updateQuery, [value, description, modifiedBy, key]);
      } else {
        // Create new setting
        const insertQuery = `
          INSERT INTO system_settings (key, value, description, modified_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `;
        
        await db.query(insertQuery, [key, value, description, modifiedBy]);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update multiple system settings at once
   * @param {Object} settings - Object with key-value pairs
   * @param {number} modifiedBy - User ID who modified the settings
   * @returns {Promise<boolean>} Success
   */
  static async updateSystemSettings(settings, modifiedBy = null) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      for (const [key, value] of Object.entries(settings)) {
        // Skip null or undefined values
        if (value === null || value === undefined) continue;
        
        // Check if setting exists
        const existsQuery = `
          SELECT 1 FROM system_settings
          WHERE key = $1
        `;
        
        const existsResult = await client.query(existsQuery, [key]);
        const exists = existsResult.rows.length > 0;
        
        if (exists) {
          // Update existing setting
          const updateQuery = `
            UPDATE system_settings
            SET value = $1, modified_by = $2, updated_at = NOW()
            WHERE key = $3
          `;
          
          await client.query(updateQuery, [value, modifiedBy, key]);
        } else {
          // Create new setting
          const insertQuery = `
            INSERT INTO system_settings (key, value, modified_by, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `;
          
          await client.query(insertQuery, [key, value, modifiedBy]);
        }
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Database error: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Delete a system setting
   * @param {string} key - Setting key
   * @returns {Promise<boolean>} Success
   */
  static async deleteSystemSetting(key) {
    try {
      const query = `
        DELETE FROM system_settings
        WHERE key = $1
      `;
      
      await db.query(query, [key]);
      return true;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

module.exports = Setting;