// server/controllers/targetsController.js

const Target = require('../models/Target');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Targets controller for handling target-related requests
 */
class TargetsController {
  /**
   * Get all targets with filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllTargets(req, res, next) {
    try {
      const filters = {
        targetType: req.query.targetType || null,
        targetId: req.query.targetId || null,
        periodStart: req.query.periodStart ? new Date(req.query.periodStart) : null,
        periodEnd: req.query.periodEnd ? new Date(req.query.periodEnd) : null,
        createdBy: req.query.createdBy || null
      };
      
      const targets = await Target.getAll(filters);
      
      res.status(200).json({
        success: true,
        data: targets,
        count: targets.length
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get target by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getTargetById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid target ID');
      }
      
      const target = await Target.getById(id);
      
      res.status(200).json({
        success: true,
        data: target
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create new target
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createTarget(req, res, next) {
    try {
      const targetData = {
        ...req.body,
        created_by: req.user.id
      };
      
      // Validate required fields
      const requiredFields = ['target_type', 'target_id', 'target_value'];
      const missingFields = requiredFields.filter(field => !targetData[field]);
      
      if (missingFields.length > 0) {
        throw ApiError.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Create the target
      const target = await Target.create(targetData);
      
      res.status(201).json({
        success: true,
        data: target,
        message: 'Target created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update a target
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateTarget(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid target ID');
      }
      
      const updates = req.body;
      
      // Update the target
      const updatedTarget = await Target.update(id, updates);
      
      res.status(200).json({
        success: true,
        data: updatedTarget,
        message: 'Target updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete a target
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteTarget(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw ApiError.badRequest('Invalid target ID');
      }
      
      // Delete the target
      await Target.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Target deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get active targets
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getActiveTargets(req, res, next) {
    try {
      const date = req.query.date ? new Date(req.query.date) : new Date();
      
      const targets = await Target.getActiveTargets(date);
      
      res.status(200).json({
        success: true,
        data: targets
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Bulk update targets
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async bulkUpdateTargets(req, res, next) {
    try {
      const { targets, options } = req.body;
      
      if (!targets || typeof targets !== 'object' || Object.keys(targets).length === 0) {
        throw ApiError.badRequest('No target data provided');
      }
      
      // Set up options with user ID
      const updateOptions = {
        ...options,
        createdBy: req.user.id
      };
      
      // Update targets
      const results = await Target.bulkUpdateTargets(targets, updateOptions);
      
      res.status(200).json({
        success: true,
        data: results,
        message: `Updated ${results.updated} and created ${results.created} targets successfully`
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get target achievement statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAchievementStats(req, res, next) {
    try {
      const filters = {
        date: req.query.date ? new Date(req.query.date) : new Date()
      };
      
      const stats = await Target.getAchievementStats(filters);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create instance for route handlers
const targetsController = new TargetsController();

// Export controller methods
module.exports = {
  getAllTargets: targetsController.getAllTargets,
  getTargetById: targetsController.getTargetById,
  createTarget: targetsController.createTarget,
  updateTarget: targetsController.updateTarget,
  deleteTarget: targetsController.deleteTarget,
  getActiveTargets: targetsController.getActiveTargets,
  bulkUpdateTargets: targetsController.bulkUpdateTargets,
  getAchievementStats: targetsController.getAchievementStats
};