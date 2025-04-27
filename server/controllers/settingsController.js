// server/controllers/settingsController.js

const Setting = require('../models/Setting');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Settings controller for handling settings-related requests
 */
class SettingsController {
  /**
   * Get user settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserSettings(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      
      // Get user settings
      const settings = await Setting.getUserSettings(userId);
      
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get a specific user setting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserSetting(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      const key = req.params.key;
      
      // Get specific user setting
      const setting = await Setting.getUserSetting(userId, key);
      
      if (setting === null) {
        return res.status(404).json({
          success: false,
          message: 'Setting not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: setting
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update user setting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateUserSetting(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      const key = req.params.key;
      const value = req.body.value;
      
      if (value === undefined) {
        throw ApiError.badRequest('Setting value is required');
      }
      
      // Update user setting
      await Setting.setUserSetting(userId, key, value);
      
      res.status(200).json({
        success: true,
        message: 'Setting updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update multiple user settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateUserSettings(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      const settings = req.body;
      
      if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
        throw ApiError.badRequest('No settings provided');
      }
      
      // Update multiple settings
      await Setting.updateUserSettings(userId, settings);
      
      res.status(200).json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete user setting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteUserSetting(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      const key = req.params.key;
      
      // Delete user setting
      await Setting.deleteUserSetting(userId, key);
      
      res.status(200).json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get system settings (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSystemSettings(req, res, next) {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        throw ApiError.forbidden('Only administrators can access system settings');
      }
      
      // Get system settings
      const settings = await Setting.getSystemSettings();
      
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get a specific system setting (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSystemSetting(req, res, next) {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        throw ApiError.forbidden('Only administrators can access system settings');
      }
      
      const key = req.params.key;
      
      // Get specific system setting
      const setting = await Setting.getSystemSetting(key);
      
      if (setting === null) {
        return res.status(404).json({
          success: false,
          message: 'Setting not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: setting
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update system setting (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateSystemSetting(req, res, next) {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        throw ApiError.forbidden('Only administrators can update system settings');
      }
      
      const key = req.params.key;
      const { value, description } = req.body;
      
      if (value === undefined) {
        throw ApiError.badRequest('Setting value is required');
      }
      
      // Update system setting
      await Setting.setSystemSetting(key, value, description, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Setting updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update multiple system settings (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateSystemSettings(req, res, next) {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        throw ApiError.forbidden('Only administrators can update system settings');
      }
      
      const settings = req.body;
      
      if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
        throw ApiError.badRequest('No settings provided');
      }
      
      // Update multiple system settings
      await Setting.updateSystemSettings(settings, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete system setting (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteSystemSetting(req, res, next) {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        throw ApiError.forbidden('Only administrators can delete system settings');
      }
      
      const key = req.params.key;
      
      // Delete system setting
      await Setting.deleteSystemSetting(key);
      
      res.status(200).json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get dashboard-specific settings for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDashboardSettings(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      
      // Get dashboard settings (a specific key in user settings)
      const dashboardSettings = await Setting.getUserSetting(userId, 'dashboardSettings');
      
      // If no settings exist yet, return default settings
      if (dashboardSettings === null) {
        const defaultSettings = {
          layout: 'default',
          visibleSections: {
            kpiCards: true,
            salesByCategory: true,
            salesByRegion: true,
            salesTrends: true,
            topProducts: true,
            topCustomers: true,
            salesByRep: true,
            targetEditor: true,
            salesForecast: true
          },
          colorTheme: 'default',
          chartStyle: 'default',
          compactView: false,
          autoRefresh: false,
          refreshInterval: 5
        };
        
        res.status(200).json({
          success: true,
          data: defaultSettings
        });
      } else {
        res.status(200).json({
          success: true,
          data: dashboardSettings
        });
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update dashboard settings for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateDashboardSettings(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      const dashboardSettings = req.body;
      
      if (!dashboardSettings || typeof dashboardSettings !== 'object') {
        throw ApiError.badRequest('Invalid dashboard settings');
      }
      
      // Update dashboard settings
      await Setting.setUserSetting(userId, 'dashboardSettings', dashboardSettings);
      
      res.status(200).json({
        success: true,
        message: 'Dashboard settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Reset dashboard settings to defaults for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async resetDashboardSettings(req, res, next) {
    try {
      // Get user ID from authenticated request
      const userId = req.user.id;
      
      // Default dashboard settings
      const defaultSettings = {
        layout: 'default',
        visibleSections: {
          kpiCards: true,
          salesByCategory: true,
          salesByRegion: true,
          salesTrends: true,
          topProducts: true,
          topCustomers: true,
          salesByRep: true,
          targetEditor: true,
          salesForecast: true
        },
        colorTheme: 'default',
        chartStyle: 'default',
        compactView: false,
        autoRefresh: false,
        refreshInterval: 5
      };
      
      // Reset to defaults
      await Setting.setUserSetting(userId, 'dashboardSettings', defaultSettings);
      
      res.status(200).json({
        success: true,
        message: 'Dashboard settings reset to defaults',
        data: defaultSettings
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create instance for route handlers
const settingsController = new SettingsController();

// Export controller methods
module.exports = {
  getUserSettings: settingsController.getUserSettings,
  getUserSetting: settingsController.getUserSetting,
  updateUserSetting: settingsController.updateUserSetting,
  updateUserSettings: settingsController.updateUserSettings,
  deleteUserSetting: settingsController.deleteUserSetting,
  getSystemSettings: settingsController.getSystemSettings,
  getSystemSetting: settingsController.getSystemSetting,
  updateSystemSetting: settingsController.updateSystemSetting,
  updateSystemSettings: settingsController.updateSystemSettings,
  deleteSystemSetting: settingsController.deleteSystemSetting,
  getDashboardSettings: settingsController.getDashboardSettings,
  updateDashboardSettings: settingsController.updateDashboardSettings,
  resetDashboardSettings: settingsController.resetDashboardSettings
};