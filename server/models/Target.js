// server/models/Target.js

const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Target model for database operations
 */
class Target {
  /**
   * Get all targets with filtering
   * @param {Object} filters - Query filters 
   * @returns {Promise<Array>} Targets data
   */
  static async getAll(filters = {}) {
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      
      // Build query conditions based on filters
      if (filters.targetType) {
        conditions.push(`t.target_type = $${paramIndex++}`);
        values.push(filters.targetType);
      }
      
      if (filters.targetId) {
        conditions.push(`t.target_id = $${paramIndex++}`);
        values.push(filters.targetId);
      }
      
      if (filters.periodStart) {
        conditions.push(`t.period_start >= $${paramIndex++}`);
        values.push(filters.periodStart);
      }
      
      if (filters.periodEnd) {
        conditions.push(`t.period_end <= $${paramIndex++}`);
        values.push(filters.periodEnd);
      }
      
      if (filters.createdBy) {
        conditions.push(`t.created_by = $${paramIndex++}`);
        values.push(filters.createdBy);
      }
      
      // Create WHERE clause if conditions exist
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';
      
      // Build and execute the query
      const query = `
        SELECT 
          t.id,
          t.target_type,
          t.target_id,
          t.period_start,
          t.period_end,
          t.target_value,
          t.currency,
          t.created_by,
          u.name AS created_by_name,
          t.created_at,
          t.updated_at
        FROM 
          targets t
        LEFT JOIN
          users u ON t.created_by = u.id
        ${whereClause}
        ORDER BY
          t.period_start DESC, t.target_type, t.target_id
      `;
      
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get target by ID
   * @param {number} id - Target ID
   * @returns {Promise<Object>} Target record
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          t.id,
          t.target_type,
          t.target_id,
          t.period_start,
          t.period_end,
          t.target_value,
          t.currency,
          t.created_by,
          u.name AS created_by_name,
          t.created_at,
          t.updated_at
        FROM 
          targets t
        LEFT JOIN
          users u ON t.created_by = u.id
        WHERE 
          t.id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw ApiError.notFound('Target not found');
      }
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Create a new target
   * @param {Object} targetData - Target data
   * @returns {Promise<Object>} Created target
   */
  static async create(targetData) {
    try {
      // Validate required fields
      if (!targetData.target_type || !targetData.target_id || !targetData.target_value) {
        throw ApiError.badRequest('Missing required fields: target_type, target_id, target_value');
      }
      
      // Check for duplicate target
      if (targetData.period_start && targetData.period_end) {
        const exists = await db.query(
          `SELECT id FROM targets 
          WHERE target_type = $1 
          AND target_id = $2 
          AND period_start = $3 
          AND period_end = $4`,
          [
            targetData.target_type,
            targetData.target_id,
            targetData.period_start,
            targetData.period_end
          ]
        );
        
        if (exists.rows.length > 0) {
          throw ApiError.badRequest('Target already exists for this period');
        }
      }
      
      // Prepare fields and values for the query
      const fields = [];
      const placeholders = [];
      const values = [];
      let paramIndex = 1;
      
      // Add each property to the query
      Object.entries(targetData).forEach(([key, value]) => {
        fields.push(key);
        placeholders.push(`$${paramIndex++}`);
        values.push(value);
      });
      
      // Add created_at and updated_at
      fields.push('created_at', 'updated_at');
      placeholders.push('NOW()', 'NOW()');
      
      // Build the query
      const query = `
        INSERT INTO targets (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING id
      `;
      
      const result = await db.query(query, values);
      
      // Return the full record
      return this.getById(result.rows[0].id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update a target
   * @param {number} id - Target ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated target
   */
  static async update(id, updates) {
    try {
      // Check if target exists
      await this.getById(id);
      
      // Prepare the update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      // Add each update field to the query
      Object.entries(updates).forEach(([key, value]) => {
        // Skip id in updates
        if (key === 'id' || key === 'created_at') return;
        
        updateFields.push(`${key} = ${paramIndex++}`);
        values.push(value);
      });
      
      // Add updated_at
      updateFields.push('updated_at = NOW()');
      
      // If no fields to update
      if (updateFields.length === 0) {
        return this.getById(id);
      }
      
      // Add id for the WHERE clause
      values.push(id);
      
      // Execute update
      const query = `
        UPDATE targets
        SET ${updateFields.join(', ')}
        WHERE id = ${paramIndex}
        RETURNING id
      `;
      
      await db.query(query, values);
      
      // Return the updated record
      return this.getById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Delete a target
   * @param {number} id - Target ID
   * @returns {Promise<boolean>} Success
   */
  static async delete(id) {
    try {
      // Check if target exists
      await this.getById(id);
      
      // Delete the record
      await db.query('DELETE FROM targets WHERE id = $1', [id]);
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get active targets for dashboard
   * @param {Date} date - Date to check targets for (defaults to current date)
   * @returns {Promise<Object>} Organized targets by type
   */
  static async getActiveTargets(date = new Date()) {
    try {
      const query = `
        SELECT 
          id,
          target_type,
          target_id,
          period_start,
          period_end,
          target_value,
          currency
        FROM 
          targets
        WHERE 
          period_start <= $1 AND period_end >= $1
        ORDER BY
          target_type, target_id
      `;
      
      const result = await db.query(query, [date.toISOString().split('T')[0]]);
      
      // Organize targets by type for easy consumption
      const organizedTargets = {
        monthly: {},
        quarterly: {},
        yearly: {},
        category: {},
        region: {},
        rep: {}
      };
      
      result.rows.forEach(target => {
        const { target_type, target_id, target_value } = target;
        
        if (target_type === 'monthly' || target_type === 'quarterly' || target_type === 'yearly') {
          organizedTargets[target_type] = target_value;
        } else if (target_type === 'category') {
          organizedTargets.category[target_id] = target_value;
        } else if (target_type === 'region') {
          organizedTargets.region[target_id] = target_value;
        } else if (target_type === 'rep') {
          organizedTargets.rep[target_id] = target_value;
        }
      });
      
      return organizedTargets;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Bulk update or create targets
   * @param {Object} targetsData - Map of targets in the format:
   * {
   *   'monthly': 100000,
   *   'yearly': 1200000,
   *   'category_Electronics': 50000,
   *   'rep_1': 20000,
   *   ...
   * }
   * @param {Object} options - Options for update
   * @returns {Promise<Object>} Update results
   */
  static async bulkUpdateTargets(targetsData, options = {}) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const results = {
        created: 0,
        updated: 0,
        errors: []
      };
      
      // Process each target entry
      for (const [key, value] of Object.entries(targetsData)) {
        try {
          // Skip if value is not provided
          if (value === undefined || value === null) continue;
          
          let targetType, targetId;
          
          // Parse key to determine target type and ID
          if (key === 'monthly' || key === 'quarterly' || key === 'yearly') {
            targetType = key;
            targetId = 'company';
          } else if (key.startsWith('category_')) {
            targetType = 'category';
            targetId = key.replace('category_', '');
          } else if (key.startsWith('region_')) {
            targetType = 'region';
            targetId = key.replace('region_', '');
          } else if (key.startsWith('rep_')) {
            targetType = 'rep';
            targetId = key.replace('rep_', '');
          } else {
            results.errors.push({ key, error: 'Invalid target key format' });
            continue;
          }
          
          // Determine period start and end dates
          let periodStart, periodEnd;
          const now = new Date();
          
          if (targetType === 'monthly') {
            // Current month
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          } else if (targetType === 'quarterly') {
            // Current quarter
            const quarter = Math.floor(now.getMonth() / 3);
            periodStart = new Date(now.getFullYear(), quarter * 3, 1);
            periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
          } else if (targetType === 'yearly') {
            // Current year
            periodStart = new Date(now.getFullYear(), 0, 1);
            periodEnd = new Date(now.getFullYear(), 11, 31);
          } else {
            // For category, region, rep - use custom period if provided or default to current year
            periodStart = options.periodStart || new Date(now.getFullYear(), 0, 1);
            periodEnd = options.periodEnd || new Date(now.getFullYear(), 11, 31);
          }
          
          // Format dates for SQL
          const formattedPeriodStart = periodStart.toISOString().split('T')[0];
          const formattedPeriodEnd = periodEnd.toISOString().split('T')[0];
          
          // Check if target already exists for this period
          const existingTarget = await client.query(
            `SELECT id FROM targets 
            WHERE target_type = $1 
            AND target_id = $2 
            AND period_start = $3 
            AND period_end = $4`,
            [targetType, targetId, formattedPeriodStart, formattedPeriodEnd]
          );
          
          if (existingTarget.rows.length > 0) {
            // Update existing target
            const targetId = existingTarget.rows[0].id;
            
            await client.query(
              `UPDATE targets 
              SET target_value = $1, updated_at = NOW() 
              WHERE id = $2`,
              [value, targetId]
            );
            
            results.updated++;
          } else {
            // Create new target
            await client.query(
              `INSERT INTO targets 
              (target_type, target_id, period_start, period_end, target_value, currency, created_by, created_at, updated_at) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
              [
                targetType,
                targetId,
                formattedPeriodStart,
                formattedPeriodEnd,
                value,
                options.currency || 'OMR',
                options.createdBy || null
              ]
            );
            
            results.created++;
          }
        } catch (error) {
          results.errors.push({ key, error: error.message });
        }
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Bulk target update error: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Get target achievement stats
   * @param {Object} filters - Query filters including date ranges
   * @returns {Promise<Object>} Achievement stats by target type
   */
  static async getAchievementStats(filters = {}) {
    try {
      // Default to current date if not specified
      const targetDate = filters.date || new Date();
      const formattedDate = targetDate.toISOString().split('T')[0];
      
      // First get active targets
      const targets = await this.getActiveTargets(targetDate);
      
      // Now get sales data for the same periods to calculate achievement
      const salesTotals = {};
      
      // Helper function to get sales totals for a period
      const getSalesTotals = async (startDate, endDate, groupBy = null, groupId = null) => {
        const conditions = [`s.date >= $1`, `s.date <= $2`];
        const values = [startDate, endDate];
        let paramIndex = 3;
        
        // Add grouping condition if provided
        if (groupBy && groupId) {
          if (groupBy === 'category') {
            conditions.push(`cat.name = ${paramIndex++}`);
            values.push(groupId);
          } else if (groupBy === 'region') {
            conditions.push(`su.name = ${paramIndex++}`);
            values.push(groupId);
          } else if (groupBy === 'rep') {
            conditions.push(`s.sales_rep_id = ${paramIndex++}`);
            values.push(groupId);
          }
        }
        
        const whereClause = conditions.join(' AND ');
        
        const query = `
          SELECT 
            SUM(s.item_net) AS total_sales
          FROM 
            sales s
          LEFT JOIN 
            products p ON s.material_id = p.id
          LEFT JOIN 
            categories cat ON p.category_id = cat.id
          LEFT JOIN 
            sales_units su ON s.sales_unit_id = su.id
          WHERE ${whereClause}
        `;
        
        const result = await db.query(query, values);
        return parseFloat(result.rows[0]?.total_sales || 0);
      };
      
      // Get date ranges for different periods
      const now = new Date(targetDate);
      
      // Monthly period
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Quarterly period
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      
      // Yearly period
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31);
      
      // Calculate totals for overall periods
      if (targets.monthly) {
        salesTotals.monthly = await getSalesTotals(
          monthStart.toISOString().split('T')[0],
          monthEnd.toISOString().split('T')[0]
        );
      }
      
      if (targets.quarterly) {
        salesTotals.quarterly = await getSalesTotals(
          quarterStart.toISOString().split('T')[0],
          quarterEnd.toISOString().split('T')[0]
        );
      }
      
      if (targets.yearly) {
        salesTotals.yearly = await getSalesTotals(
          yearStart.toISOString().split('T')[0],
          yearEnd.toISOString().split('T')[0]
        );
      }
      
      // Calculate totals for categories
      salesTotals.category = {};
      for (const categoryId of Object.keys(targets.category)) {
        salesTotals.category[categoryId] = await getSalesTotals(
          yearStart.toISOString().split('T')[0],
          yearEnd.toISOString().split('T')[0],
          'category',
          categoryId
        );
      }
      
      // Calculate totals for regions
      salesTotals.region = {};
      for (const regionId of Object.keys(targets.region)) {
        salesTotals.region[regionId] = await getSalesTotals(
          yearStart.toISOString().split('T')[0],
          yearEnd.toISOString().split('T')[0],
          'region',
          regionId
        );
      }
      
      // Calculate totals for sales reps
      salesTotals.rep = {};
      for (const repId of Object.keys(targets.rep)) {
        salesTotals.rep[repId] = await getSalesTotals(
          yearStart.toISOString().split('T')[0],
          yearEnd.toISOString().split('T')[0],
          'rep',
          repId
        );
      }
      
      // Calculate achievement percentages
      const achievement = {
        monthly: targets.monthly ? (salesTotals.monthly / targets.monthly) * 100 : null,
        quarterly: targets.quarterly ? (salesTotals.quarterly / targets.quarterly) * 100 : null,
        yearly: targets.yearly ? (salesTotals.yearly / targets.yearly) * 100 : null,
        category: {},
        region: {},
        rep: {}
      };
      
      // Calculate percentages for each category
      for (const [categoryId, target] of Object.entries(targets.category)) {
        const sales = salesTotals.category[categoryId] || 0;
        achievement.category[categoryId] = target > 0 ? (sales / target) * 100 : null;
      }
      
      // Calculate percentages for each region
      for (const [regionId, target] of Object.entries(targets.region)) {
        const sales = salesTotals.region[regionId] || 0;
        achievement.region[regionId] = target > 0 ? (sales / target) * 100 : null;
      }
      
      // Calculate percentages for each sales rep
      for (const [repId, target] of Object.entries(targets.rep)) {
        const sales = salesTotals.rep[repId] || 0;
        achievement.rep[repId] = target > 0 ? (sales / target) * 100 : null;
      }
      
      return {
        targets,
        sales: salesTotals,
        achievement
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}