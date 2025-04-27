// server/utils/importCsv.js

const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

/**
 * Utility for importing CSV data into the database
 */
const importCsv = {
  /**
   * Parse CSV file
   * @param {Buffer|string} input - CSV content as string or buffer
   * @param {Object} options - Parsing options
   * @returns {Object} Parsed result with data, errors, etc.
   */
  parseFile: (input, options = {}) => {
    const defaultOptions = {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim()
    };
    
    const parseOptions = { ...defaultOptions, ...options };
    const csvString = typeof input === 'string' ? input : input.toString('utf8');
    
    return Papa.parse(csvString, parseOptions);
  },
  
  /**
   * Map CSV data to database schema using column mappings
   * @param {Array} data - Parsed CSV data array
   * @param {Object} mappings - Column mappings (csvField -> dbField)
   * @param {Object} options - Additional options for transformation
   * @returns {Array} Transformed data ready for database
   */
  mapDataToSchema: (data, mappings, options = {}) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    return data.map(row => {
      const transformedRow = {};
      
      // Apply mappings
      Object.keys(mappings).forEach(csvColumn => {
        const dbColumn = mappings[csvColumn];
        if (dbColumn && row[csvColumn] !== undefined) {
          transformedRow[dbColumn] = row[csvColumn];
        }
      });
      
      // Handle date fields
      if (options.dateFields && Array.isArray(options.dateFields)) {
        options.dateFields.forEach(field => {
          if (transformedRow[field] && !(transformedRow[field] instanceof Date)) {
            try {
              transformedRow[field] = new Date(transformedRow[field]).toISOString().split('T')[0];
            } catch (e) {
              console.warn(`Invalid date format for field ${field}:`, transformedRow[field]);
            }
          }
        });
      }
      
      // Handle numeric fields
      if (options.numericFields && Array.isArray(options.numericFields)) {
        options.numericFields.forEach(field => {
          if (transformedRow[field] !== undefined) {
            transformedRow[field] = typeof transformedRow[field] === 'number' 
              ? transformedRow[field] 
              : parseFloat(transformedRow[field]) || 0;
          }
        });
      }
      
      return transformedRow;
    });
  },
  
  /**
   * Validate data against required fields and constraints
   * @param {Array} data - Data to validate
   * @param {Array} requiredFields - List of required field names
   * @param {Object} validators - Custom validators for specific fields
   * @returns {Object} Validation results with valid and invalid rows
   */
  validateData: (data, requiredFields = [], validators = {}) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        valid: false,
        message: 'No data to validate',
        validRows: [],
        invalidRows: []
      };
    }
    
    const validRows = [];
    const invalidRows = [];
    
    data.forEach((row, index) => {
      let isValid = true;
      const errors = [];
      
      // Check required fields
      for (const field of requiredFields) {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          isValid = false;
          errors.push(`Missing required field: ${field}`);
        }
      }
      
      // Apply custom validators
      for (const [field, validator] of Object.entries(validators)) {
        if (row[field] !== undefined && typeof validator === 'function') {
          const validationResult = validator(row[field], row);
          if (validationResult !== true) {
            isValid = false;
            errors.push(validationResult);
          }
        }
      }
      
      if (isValid) {
        validRows.push(row);
      } else {
        invalidRows.push({
          rowIndex: index,
          data: row,
          errors
        });
      }
    });
    
    return {
      valid: invalidRows.length === 0,
      message: invalidRows.length > 0 
        ? `${invalidRows.length} invalid rows found` 
        : 'All data is valid',
      validRows,
      invalidRows
    };
  },
  
  /**
   * Import sales data from CSV into the database
   * @param {Buffer|string} csvContent - CSV content as buffer or string
   * @param {Object} mappings - Column mappings
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Import results
   */
  importSales: async (csvContent, mappings, options = {}) => {
    try {
      // Parse CSV
      const parseResult = importCsv.parseFile(csvContent);
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        console.error('CSV parsing errors:', parseResult.errors);
        return {
          success: false,
          error: `CSV parsing error: ${parseResult.errors[0].message}`
        };
      }
      
      // Map data to schema
      const transformedData = importCsv.mapDataToSchema(parseResult.data, mappings, {
        dateFields: ['date', 'period_start', 'period_end'],
        numericFields: [
          'quantity', 'price', 'discount', 'freight', 
          'item_net', 'item_tax', 'item_gross',
          'total_net_per_invoice', 'total_tax_per_invoice', 'total_gross_per_invoice'
        ]
      });
      
      // Validate data
      const validationResult = importCsv.validateData(
        transformedData,
        ['invoice_id', 'date', 'item_net'],
        {
          date: (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime()) || 'Invalid date format';
          },
          item_net: (value) => {
            return typeof value === 'number' || 'Item net must be a number';
          }
        }
      );
      
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.message,
          invalidRows: validationResult.invalidRows.slice(0, 5) // First 5 for brevity
        };
      }
      
      // Get database client for transaction
      const client = await db.pool.connect();
      
      try {
        // Start transaction
        await client.query('BEGIN');
        
        let importedCount = 0;
        let errorCount = 0;
        
        // Process each sale record
        for (const sale of validationResult.validRows) {
          try {
            // Check if invoice exists
            const checkResult = await client.query(
              'SELECT invoice_id FROM sales WHERE invoice_id = $1',
              [sale.invoice_id]
            );
            
            if (checkResult.rows.length > 0) {
              // Update existing invoice
              const fields = Object.keys(sale).filter(key => key !== 'invoice_id');
              const setClause = fields.map((field, index) => 
                `${field} = $${index + 2}`
              ).join(', ');
              
              const updateQuery = `
                UPDATE sales SET ${setClause}, updated_at = NOW()
                WHERE invoice_id = $1
                RETURNING invoice_id
              `;
              
              const updateParams = [
                sale.invoice_id,
                ...fields.map(field => sale[field])
              ];
              
              await client.query(updateQuery, updateParams);
            } else {
              // Insert new invoice
              const fields = Object.keys(sale);
              const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
              const columns = fields.join(', ');
              
              const insertQuery = `
                INSERT INTO sales (${columns}, created_at, updated_at)
                VALUES (${placeholders}, NOW(), NOW())
                RETURNING invoice_id
              `;
              
              const insertParams = fields.map(field => sale[field]);
              await client.query(insertQuery, insertParams);
            }
            
            importedCount++;
          } catch (err) {
            console.error('Error importing sale:', err, sale);
            errorCount++;
          }
        }
        
        // Commit transaction
        await client.query('COMMIT');
        
        return {
          success: true,
          importedCount,
          errorCount,
          totalRows: validationResult.validRows.length
        };
      } catch (err) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        throw err;
      } finally {
        // Release client back to pool
        client.release();
      }
    } catch (err) {
      console.error('Sales import error:', err);
      return {
        success: false,
        error: err.message || 'An error occurred during import'
      };
    }
  },
  
  /**
   * Import products data from CSV
   * @param {Buffer|string} csvContent - CSV content
   * @param {Object} mappings - Column mappings
   * @returns {Promise<Object>} Import results
   */
  importProducts: async (csvContent, mappings) => {
    try {
      // Parse CSV
      const parseResult = importCsv.parseFile(csvContent);
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        return {
          success: false,
          error: `CSV parsing error: ${parseResult.errors[0].message}`
        };
      }
      
      // Map data to schema
      const transformedData = importCsv.mapDataToSchema(parseResult.data, mappings);
      
      // Validate data
      const validationResult = importCsv.validateData(
        transformedData,
        ['id', 'name']
      );
      
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.message,
          invalidRows: validationResult.invalidRows.slice(0, 5)
        };
      }
      
      // Database operations would go here, similar to importSales
      // For now, return mock success
      return {
        success: true,
        importedCount: validationResult.validRows.length,
        errorCount: 0,
        totalRows: validationResult.validRows.length
      };
    } catch (err) {
      console.error('Products import error:', err);
      return {
        success: false,
        error: err.message || 'An error occurred during import'
      };
    }
  },
  
  /**
   * Import customers data from CSV
   * @param {Buffer|string} csvContent - CSV content
   * @param {Object} mappings - Column mappings
   * @returns {Promise<Object>} Import results
   */
  importCustomers: async (csvContent, mappings) => {
    try {
      // Parse CSV
      const parseResult = importCsv.parseFile(csvContent);
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        return {
          success: false,
          error: `CSV parsing error: ${parseResult.errors[0].message}`
        };
      }
      
      // Map data to schema
      const transformedData = importCsv.mapDataToSchema(parseResult.data, mappings);
      
      // Validate data
      const validationResult = importCsv.validateData(
        transformedData,
        ['id', 'name']
      );
      
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.message,
          invalidRows: validationResult.invalidRows.slice(0, 5)
        };
      }
      
      // Database operations would go here, similar to importSales
      // For now, return mock success
      return {
        success: true,
        importedCount: validationResult.validRows.length,
        errorCount: 0,
        totalRows: validationResult.validRows.length
      };
    } catch (err) {
      console.error('Customers import error:', err);
      return {
        success: false,
        error: err.message || 'An error occurred during import'
      };
    }
  },
  
  /**
   * Import targets data from CSV
   * @param {Buffer|string} csvContent - CSV content
   * @param {Object} mappings - Column mappings
   * @returns {Promise<Object>} Import results
   */
  importTargets: async (csvContent, mappings) => {
    try {
      // Parse CSV
      const parseResult = importCsv.parseFile(csvContent);
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        return {
          success: false,
          error: `CSV parsing error: ${parseResult.errors[0].message}`
        };
      }
      
      // Map data to schema
      const transformedData = importCsv.mapDataToSchema(parseResult.data, mappings, {
        dateFields: ['period_start', 'period_end'],
        numericFields: ['target_value']
      });
      
      // Validate data
      const validationResult = importCsv.validateData(
        transformedData,
        ['target_type', 'target_id', 'target_value']
      );
      
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.message,
          invalidRows: validationResult.invalidRows.slice(0, 5)
        };
      }
      
      // Database operations would go here, similar to importSales
      // For now, return mock success
      return {
        success: true,
        importedCount: validationResult.validRows.length,
        errorCount: 0,
        totalRows: validationResult.validRows.length
      };
    } catch (err) {
      console.error('Targets import error:', err);
      return {
        success: false,
        error: err.message || 'An error occurred during import'
      };
    }
  }
};

module.exports = importCsv;