// server/models/Sale.js

const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Sale model for database operations
 */
class Sale {
  /**
   * Get all sales with filtering
   * @param {Object} filters - Query filters 
   * @returns {Promise<Array>} Sales data
   */
  static async getAll(filters = {}) {
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      
      // Build query conditions based on filters
      if (filters.startDate) {
        conditions.push(`s.date >= $${paramIndex++}`);
        values.push(filters.startDate);
      }
      
      if (filters.endDate) {
        conditions.push(`s.date <= $${paramIndex++}`);
        values.push(filters.endDate);
      }
      
      if (filters.salesUnit) {
        conditions.push(`s.sales_unit_id = $${paramIndex++}`);
        values.push(filters.salesUnit);
      }
      
      if (filters.customer) {
        conditions.push(`s.customer_id = $${paramIndex++}`);
        values.push(filters.customer);
      }
      
      if (filters.material) {
        conditions.push(`s.material_id = $${paramIndex++}`);
        values.push(filters.material);
      }
      
      if (filters.category) {
        conditions.push(`p.category_id = $${paramIndex++}`);
        values.push(filters.category);
      }
      
      if (filters.salesRepId) {
        conditions.push(`s.sales_rep_id = $${paramIndex++}`);
        values.push(filters.salesRepId);
      }
      
      // Create WHERE clause if conditions exist
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';
      
      // Add pagination
      const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
      if (filters.limit) values.push(parseInt(filters.limit));
      
      const offsetClause = filters.offset ? `OFFSET $${paramIndex++}` : '';
      if (filters.offset) values.push(parseInt(filters.offset));
      
      // Build and execute the query
      const query = `
        SELECT 
          s.invoice_id,
          s.company_id,
          s.tax_country_code,
          s.tax_code,
          s.customer_id,
          c.name AS customer_name,
          s.date,
          s.sales_unit_id,
          su.name AS sales_unit_name,
          s.site_id,
          s.logistics_area,
          s.type,
          s.material_id,
          p.name AS material_name,
          cat.name AS category,
          s.adg,
          s.quantity,
          s.identified_stock_id,
          s.currency,
          s.unit_code,
          s.price,
          s.discount,
          s.freight,
          s.item_net,
          s.item_tax,
          s.item_gross,
          s.total_net_per_invoice,
          s.total_tax_per_invoice,
          s.total_gross_per_invoice,
          s.sales_rep_id,
          u.name AS sales_rep_name,
          s.created_at,
          s.updated_at
        FROM 
          sales s
        LEFT JOIN 
          customers c ON s.customer_id = c.id
        LEFT JOIN 
          sales_units su ON s.sales_unit_id = su.id
        LEFT JOIN 
          products p ON s.material_id = p.id
        LEFT JOIN 
          categories cat ON p.category_id = cat.id
        LEFT JOIN 
          users u ON s.sales_rep_id = u.id
        ${whereClause}
        ORDER BY 
          s.date DESC, s.invoice_id
        ${limitClause}
        ${offsetClause}
      `;
      
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get sale by invoice ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Sale record
   */
  static async getByInvoiceId(invoiceId) {
    try {
      const query = `
        SELECT 
          s.invoice_id,
          s.company_id,
          s.tax_country_code,
          s.tax_code,
          s.customer_id,
          c.name AS customer_name,
          s.date,
          s.sales_unit_id,
          su.name AS sales_unit_name,
          s.site_id,
          s.logistics_area,
          s.type,
          s.material_id,
          p.name AS material_name,
          cat.name AS category,
          s.adg,
          s.quantity,
          s.identified_stock_id,
          s.currency,
          s.unit_code,
          s.price,
          s.discount,
          s.freight,
          s.item_net,
          s.item_tax,
          s.item_gross,
          s.total_net_per_invoice,
          s.total_tax_per_invoice,
          s.total_gross_per_invoice,
          s.sales_rep_id,
          u.name AS sales_rep_name,
          s.created_at,
          s.updated_at
        FROM 
          sales s
        LEFT JOIN 
          customers c ON s.customer_id = c.id
        LEFT JOIN 
          sales_units su ON s.sales_unit_id = su.id
        LEFT JOIN 
          products p ON s.material_id = p.id
        LEFT JOIN 
          categories cat ON p.category_id = cat.id
        LEFT JOIN 
          users u ON s.sales_rep_id = u.id
        WHERE 
          s.invoice_id = $1
      `;
      
      const result = await db.query(query, [invoiceId]);
      
      if (result.rows.length === 0) {
        throw ApiError.notFound('Sale not found');
      }
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Create a new sale record
   * @param {Object} saleData - Sale data
   * @returns {Promise<Object>} Created sale
   */
  static async create(saleData) {
    try {
      // Check if invoice_id already exists
      const exists = await db.query(
        'SELECT invoice_id FROM sales WHERE invoice_id = $1',
        [saleData.invoice_id]
      );
      
      if (exists.rows.length > 0) {
        throw ApiError.badRequest('Invoice ID already exists');
      }
      
      // Prepare fields and values for the query
      const fields = [];
      const placeholders = [];
      const values = [];
      let paramIndex = 1;
      
      // Add each property to the query
      Object.entries(saleData).forEach(([key, value]) => {
        fields.push(key);
        placeholders.push(`$${paramIndex++}`);
        values.push(value);
      });
      
      // Add created_at and updated_at
      fields.push('created_at', 'updated_at');
      placeholders.push('NOW()', 'NOW()');
      
      // Build the query
      const query = `
        INSERT INTO sales (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING invoice_id
      `;
      
      const result = await db.query(query, values);
      
      // Return the full record
      return this.getByInvoiceId(result.rows[0].invoice_id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Update a sale record
   * @param {string} invoiceId - Invoice ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated sale
   */
  static async update(invoiceId, updates) {
    try {
      // Check if invoice exists
      await this.getByInvoiceId(invoiceId);
      
      // Prepare the update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      // Add each update field to the query
      Object.entries(updates).forEach(([key, value]) => {
        // Skip invoice_id in updates
        if (key === 'invoice_id') return;
        
        updateFields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      });
      
      // Add updated_at
      updateFields.push('updated_at = NOW()');
      
      // Add invoice_id for the WHERE clause
      values.push(invoiceId);
      
      // Execute update
      const query = `
        UPDATE sales
        SET ${updateFields.join(', ')}
        WHERE invoice_id = $${paramIndex}
        RETURNING invoice_id
      `;
      
      await db.query(query, values);
      
      // Return the updated record
      return this.getByInvoiceId(invoiceId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Delete a sale record
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<boolean>} Success
   */
  static async delete(invoiceId) {
    try {
      // Check if invoice exists
      await this.getByInvoiceId(invoiceId);
      
      // Delete the record
      await db.query('DELETE FROM sales WHERE invoice_id = $1', [invoiceId]);
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Get sales analytics with grouping and aggregation
   * @param {Object} options - Analytics options
   * @returns {Promise<Array>} Analytics data
   */
  static async getAnalytics(options = {}) {
    try {
      const { 
        startDate, 
        endDate, 
        groupBy = 'date', 
        aggregation = 'sum',
        filters = {} 
      } = options;
      
      // Validate groupBy field
      const validGroupings = ['date', 'month', 'category', 'customer', 'sales_unit', 'material', 'sales_rep'];
      if (!validGroupings.includes(groupBy)) {
        throw ApiError.badRequest(`Invalid groupBy parameter: ${groupBy}`);
      }
      
      // Build grouping expression
      let groupByExpr;
      let groupByLabel;
      
      switch (groupBy) {
        case 'date':
          groupByExpr = 's.date';
          groupByLabel = 's.date AS label';
          break;
        case 'month':
          groupByExpr = "TO_CHAR(s.date, 'YYYY-MM')";
          groupByLabel = "TO_CHAR(s.date, 'YYYY-MM') AS label";
          break;
        case 'category':
          groupByExpr = 'cat.name';
          groupByLabel = 'cat.name AS label';
          break;
        case 'customer':
          groupByExpr = 'c.name';
          groupByLabel = 'c.name AS label';
          break;
        case 'sales_unit':
          groupByExpr = 'su.name';
          groupByLabel = 'su.name AS label';
          break;
        case 'material':
          groupByExpr = 'p.name';
          groupByLabel = 'p.name AS label';
          break;
        case 'sales_rep':
          groupByExpr = 'u.name';
          groupByLabel = 'u.name AS label';
          break;
      }
      
      // Build aggregation function
      let aggregationFn;
      
      switch (aggregation) {
        case 'sum':
          aggregationFn = 'SUM(s.item_net)';
          break;
        case 'avg':
          aggregationFn = 'AVG(s.item_net)';
          break;
        case 'count':
          aggregationFn = 'COUNT(*)';
          break;
        case 'min':
          aggregationFn = 'MIN(s.item_net)';
          break;
        case 'max':
          aggregationFn = 'MAX(s.item_net)';
          break;
        default:
          aggregationFn = 'SUM(s.item_net)';
      }
      
      // Build WHERE conditions
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
      
      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (!value || value === 'all') return;
        
        switch (key) {
          case 'salesUnit':
            conditions.push(`s.sales_unit_id = $${paramIndex++}`);
            values.push(value);
            break;
          case 'customer':
            conditions.push(`s.customer_id = $${paramIndex++}`);
            values.push(value);
            break;
          case 'material':
            conditions.push(`s.material_id = $${paramIndex++}`);
            values.push(value);
            break;
          case 'category':
            conditions.push(`p.category_id = $${paramIndex++}`);
            values.push(value);
            break;
          case 'salesRep':
            conditions.push(`s.sales_rep_id = $${paramIndex++}`);
            values.push(value);
            break;
        }
      });
      
      // Create WHERE clause
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';
      
      // Build and execute the query
      const query = `
        SELECT 
          ${groupByLabel},
          ${aggregationFn} AS value
        FROM 
          sales s
        LEFT JOIN 
          customers c ON s.customer_id = c.id
        LEFT JOIN 
          sales_units su ON s.sales_unit_id = su.id
        LEFT JOIN 
          products p ON s.material_id = p.id
        LEFT JOIN 
          categories cat ON p.category_id = cat.id
        LEFT JOIN 
          users u ON s.sales_rep_id = u.id
        ${whereClause}
        GROUP BY 
          ${groupByExpr}
        ORDER BY 
          ${groupBy === 'date' || groupBy === 'month' ? 'label' : 'value DESC'}
      `;
      
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Database error: ${error.message}`);
    }
  }
  
  /**
   * Import multiple sales records
   * @param {Array} salesData - Array of sale records
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Import results
   */
  static async importBatch(salesData, options = {}) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      let importedCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Process each sale record
      for (const sale of salesData) {
        try {
          // Check if invoice_id already exists
          const exists = await client.query(
            'SELECT invoice_id FROM sales WHERE invoice_id = $1',
            [sale.invoice_id]
          );
          
          if (exists.rows.length > 0) {
            // If record exists and update is enabled
            if (options.updateExisting) {
              // Prepare update fields
              const updateFields = [];
              const values = [];
              let paramIndex = 1;
              
              // Add each property to the query
              Object.entries(sale).forEach(([key, value]) => {
                // Skip invoice_id for the SET clause
                if (key === 'invoice_id') return;
                
                updateFields.push(`${key} = $${paramIndex++}`);
                values.push(value);
              });
              
              // Add updated_at
              updateFields.push('updated_at = NOW()');
              
              // Add invoice_id for the WHERE clause
              values.push(sale.invoice_id);
              
              // Execute update
              await client.query(`
                UPDATE sales
                SET ${updateFields.join(', ')}
                WHERE invoice_id = $${paramIndex}
              `, values);
              
              importedCount++;
            } else {
              // Skip existing record
              errors.push({ invoice_id: sale.invoice_id, error: 'Invoice ID already exists' });
              errorCount++;
              continue;
            }
          } else {
            // Insert new record
            const fields = [];
            const placeholders = [];
            const values = [];
            let paramIndex = 1;
            
            // Add each property to the query
            Object.entries(sale).forEach(([key, value]) => {
              fields.push(key);
              placeholders.push(`$${paramIndex++}`);
              values.push(value);
            });
            
            // Add created_at and updated_at
            fields.push('created_at', 'updated_at');
            placeholders.push('NOW()', 'NOW()');
            
            // Execute insert
            await client.query(`
              INSERT INTO sales (${fields.join(', ')})
              VALUES (${placeholders.join(', ')})
            `, values);
            
            importedCount++;
          }
        } catch (error) {
          console.error('Error importing sale:', error, sale);
          errors.push({ invoice_id: sale.invoice_id, error: error.message });
          errorCount++;
        }
      }
      
      await client.query('COMMIT');
      
      return {
        success: true,
        importedCount,
        errorCount,
        errors: errors.slice(0, 10), // Return the first 10 errors
        totalRows: salesData.length
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Import batch error: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Get sales summary metrics
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object>} Summary metrics
   */
  static async getSummary(filters = {}) {
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      
      // Build query conditions based on filters
      if (filters.startDate) {
        conditions.push(`s.date >= $${paramIndex++}`);
        values.push(filters.startDate);
      }
      
      if (filters.endDate) {
        conditions.push(`s.date <= $${paramIndex++}`);
        values.push(filters.endDate);
      }
      
      if (filters.salesUnit) {
        conditions.push(`s.sales_unit_id = $${paramIndex++}`);
        values.push(filters.salesUnit);
      }
      
      if (filters.customer) {
        conditions.push(`s.customer_id = $${paramIndex++}`);
        values.push(filters.customer);
      }
      
      if (filters.material) {
        conditions.push(`s.material_id = $${paramIndex++}`);
        values.push(filters.material);
      }
      
      if (filters.category) {
        conditions.push(`p.category_id = $${paramIndex++}`);
        values.push(filters.category);
      }
      
      if (filters.salesRepId) {
        conditions.push(`s.sales_rep_id = $${paramIndex++}`);
        values.push(filters.salesRepId);
      }
      
      // Create WHERE clause if conditions exist
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';
      
      // Build and execute the query
      const query = `
        SELECT 
          SUM(s.item_net) AS total_sales,
          COUNT(DISTINCT s.invoice_id) AS invoice_count,
          COUNT(*) AS line_item_count,
          AVG(s.item_net) AS average_sale,
          MIN(s.date) AS first_date,
          MAX(s.date) AS last_date,
          COUNT(DISTINCT s.customer_id) AS customer_count,
          COUNT(DISTINCT s.material_id) AS product_count,
          COUNT(DISTINCT s.sales_unit_id) AS sales_unit_count
        FROM 
          sales s
        LEFT JOIN 
          products p ON s.material_id = p.id
        ${whereClause}
      `;
      
      const result = await db.query(query, values);
      
      // Calculate period-over-period comparison if date filters exist
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        const duration = endDate.getTime() - startDate.getTime();
        
        // Calculate date range for previous period
        const prevStartDate = new Date(startDate.getTime() - duration);
        const prevEndDate = new Date(startDate.getTime() - 1); // Day before start date
        
        // Same query for previous period
        const prevConditions = [...conditions];
        const prevValues = [...values];
        
        // Replace date conditions with previous period
        const dateStartIndex = conditions.findIndex(c => c.includes('s.date >='));
        const dateEndIndex = conditions.findIndex(c => c.includes('s.date <='));
        
        if (dateStartIndex !== -1) {
          prevConditions[dateStartIndex] = `s.date >= $${paramIndex++}`;
          prevValues[dateStartIndex] = prevStartDate.toISOString().split('T')[0];
        } else {
          prevConditions.push(`s.date >= $${paramIndex++}`);
          prevValues.push(prevStartDate.toISOString().split('T')[0]);
        }
        
        if (dateEndIndex !== -1) {
          prevConditions[dateEndIndex] = `s.date <= $${paramIndex++}`;
          prevValues[dateEndIndex] = prevEndDate.toISOString().split('T')[0];
        } else {
          prevConditions.push(`s.date <= $${paramIndex++}`);
          prevValues.push(prevEndDate.toISOString().split('T')[0]);
        }
        
        const prevWhereClause = prevConditions.length > 0 
          ? `WHERE ${prevConditions.join(' AND ')}` 
          : '';
        
        const prevQuery = `
          SELECT 
            SUM(s.item_net) AS total_sales
          FROM 
            sales s
          LEFT JOIN 
            products p ON s.material_id = p.id
          ${prevWhereClause}
        `;
        
        const prevResult = await db.query(prevQuery, prevValues);
        
        // Calculate growth rate
        const currentSales = parseFloat(result.rows[0].total_sales) || 0;
        const prevSales = parseFloat(prevResult.rows[0]?.total_sales) || 0;
        
        let growthRate = 0;
        if (prevSales > 0) {
          growthRate = ((currentSales - prevSales) / prevSales) * 100;
        } else if (currentSales > 0) {
          growthRate = 100; // If previous period had no sales
        }
        
        // Add growth to result
        result.rows[0].growth_rate = growthRate;
        result.rows[0].previous_period_sales = prevSales;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

module.exports = Sale;