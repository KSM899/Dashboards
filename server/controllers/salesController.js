// server/controllers/salesController.js

const Sale = require('../models/Sale');
const { ApiError } = require('../middleware/errorHandler');
const Papa = require('papaparse');

/**
 * Sales controller for handling sales-related requests
 */
class SalesController {
  /**
   * Get all sales with filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllSales(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : null,
        endDate: req.query.endDate ? new Date(req.query.endDate) : null,
        salesUnit: req.query.salesUnit || null,
        customer: req.query.customer || null,
        material: req.query.material || null,
        category: req.query.category || null,
        salesRepId: req.query.salesRepId || null,
        limit: req.query.limit ? parseInt(req.query.limit) : null,
        offset: req.query.offset ? parseInt(req.query.offset) : null
      };
      
      const sales = await Sale.getAll(filters);
      
      // Calculate totals
      const totals = sales.reduce((acc, sale) => {
        acc.totalNet += parseFloat(sale.item_net || 0);
        acc.totalTax += parseFloat(sale.item_tax || 0);
        acc.totalGross += parseFloat(sale.item_gross || 0);
        return acc;
      }, { totalNet: 0, totalTax: 0, totalGross: 0 });
      
      res.status(200).json({
        success: true,
        data: sales,
        totals,
        count: sales.length
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get sales analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSalesAnalytics(req, res, next) {
    try {
      const options = {
        startDate: req.body.startDate || null,
        endDate: req.body.endDate || null,
        groupBy: req.body.groupBy || 'date',
        aggregation: req.body.aggregation || 'sum',
        filters: req.body.filters || {}
      };
      
      const analyticsData = await Sale.getAnalytics(options);
      
      res.status(200).json({
        success: true,
        data: analyticsData
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get sale by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSaleById(req, res, next) {
    try {
      const invoiceId = req.params.id;
      
      const sale = await Sale.getByInvoiceId(invoiceId);
      
      res.status(200).json({
        success: true,
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create new sale
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createSale(req, res, next) {
    try {
      // Validate required fields
      const requiredFields = ['invoice_id', 'date', 'item_net'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        throw ApiError.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const saleData = req.body;
      
      // Create the sale
      const sale = await Sale.create(saleData);
      
      // Log the activity
      if (req.user) {
        await db.query(
          'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            req.user.id,
            'CREATE',
            'sales',
            sale.invoice_id,
            JSON.stringify({ invoice_id: sale.invoice_id }),
            req.ip
          ]
        );
      }
      
      res.status(201).json({
        success: true,
        data: sale,
        message: 'Sale created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update a sale
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateSale(req, res, next) {
    try {
      const invoiceId = req.params.id;
      const updates = req.body;
      
      // Prevent changing invoice_id
      if (updates.invoice_id && updates.invoice_id !== invoiceId) {
        throw ApiError.badRequest('Cannot change invoice_id');
      }
      
      // Update the sale
      const updatedSale = await Sale.update(invoiceId, updates);
      
      // Log the activity
      if (req.user) {
        await db.query(
          'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            req.user.id,
            'UPDATE',
            'sales',
            invoiceId,
            JSON.stringify({ invoice_id: invoiceId, updates }),
            req.ip
          ]
        );
      }
      
      res.status(200).json({
        success: true,
        data: updatedSale,
        message: 'Sale updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete a sale
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteSale(req, res, next) {
    try {
      const invoiceId = req.params.id;
      
      // Delete the sale
      await Sale.delete(invoiceId);
      
      // Log the activity
      if (req.user) {
        await db.query(
          'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            req.user.id,
            'DELETE',
            'sales',
            invoiceId,
            JSON.stringify({ invoice_id: invoiceId }),
            req.ip
          ]
        );
      }
      
      res.status(200).json({
        success: true,
        message: 'Sale deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get sales summary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSalesSummary(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : null,
        endDate: req.query.endDate ? new Date(req.query.endDate) : null,
        salesUnit: req.query.salesUnit || null,
        customer: req.query.customer || null,
        category: req.query.category || null,
        salesRepId: req.query.salesRepId || null
      };
      
      const summary = await Sale.getSummary(filters);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Export sales data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async exportSales(req, res, next) {
    try {
      const { format, filters } = req.body;
      
      // Get sales with filters
      const sales = await Sale.getAll(filters);
      
      if (sales.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No data found to export'
        });
      }
      
      // Determine export format
      if (format === 'csv') {
        // Convert data to CSV format
        const csvData = Papa.unparse(sales);
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_export.csv');
        
        // Send CSV data
        return res.send(csvData);
      } else if (format === 'json') {
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_export.json');
        
        // Send JSON data
        return res.send(JSON.stringify(sales, null, 2));
      } else {
        throw ApiError.badRequest('Unsupported export format');
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Import sales data from CSV
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async importSales(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }
      
      const fileBuffer = req.file.buffer;
      const mappings = JSON.parse(req.body.mappings || '{}');
      const csvString = fileBuffer.toString('utf8');
      
      // Parse CSV data
      const parseResult = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        transformHeader: header => header.trim()
      });
      
      if (parseResult.errors?.length) {
        return res.status(400).json({
          success: false,
          error: parseResult.errors[0].message
        });
      }
      
      const csvData = parseResult.data;
      if (!csvData || csvData.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No data found in CSV file'
        });
      }
      
      // Transform CSV data to match database schema
      const salesData = csvData.map(row => {
        const transformedRow = {};
        
        Object.keys(mappings).forEach(csvCol => {
          const dbCol = mappings[csvCol];
          if (dbCol && row[csvCol] !== undefined) {
            transformedRow[dbCol] = row[csvCol];
          }
        });
        
        // Format date
        if (transformedRow.date) {
          try {
            transformedRow.date = new Date(transformedRow.date).toISOString().split('T')[0];
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }
        
        // Parse numbers
        ['quantity', 'price', 'discount', 'freight', 'item_net', 'item_tax', 'item_gross',
         'total_net_per_invoice', 'total_tax_per_invoice', 'total_gross_per_invoice'].forEach(field => {
          if (transformedRow[field] !== undefined) {
            transformedRow[field] = parseFloat(transformedRow[field]) || 0;
          }
        });
        
        return transformedRow;
      });
      
      // Validate required fields
      const invalidRows = salesData.filter(row =>
        !row.invoice_id || !row.date || row.item_net === undefined
      );
      
      if (invalidRows.length > 0) {
        return res.status(400).json({
          success: false,
          error: `${invalidRows.length} rows missing required fields (invoice_id, date, item_net)`,
          invalidRows: invalidRows.slice(0, 5) // Return first 5 invalid rows
        });
      }
      
      // Import data
      const importResults = await Sale.importBatch(salesData, {
        updateExisting: req.body.updateExisting === 'true'
      });
      
      // Log the activity
      if (req.user) {
        await db.query(
          'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            req.user.id,
            'IMPORT',
            'sales',
            'bulk-import',
            JSON.stringify({
              filename: req.file.originalname,
              totalRows: salesData.length,
              imported: importResults.importedCount,
              errors: importResults.errorCount
            }),
            req.ip
          ]
        );
      }
      
      return res.status(200).json({
        success: true,
        message: `Imported ${importResults.importedCount} records successfully${
          importResults.errorCount > 0 ? `, with ${importResults.errorCount} errors` : ''
        }`,
        importedCount: importResults.importedCount,
        errorCount: importResults.errorCount,
        errors: importResults.errors,
        totalRows: salesData.length
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create instance for route handlers
const salesController = new SalesController();

// Export controller methods
module.exports = {
  getAllSales: salesController.getAllSales,
  getSalesAnalytics: salesController.getSalesAnalytics,
  getSaleById: salesController.getSaleById,
  createSale: salesController.createSale,
  updateSale: salesController.updateSale,
  deleteSale: salesController.deleteSale,
  getSalesSummary: salesController.getSalesSummary,
  exportSales: salesController.exportSales,
  importSales: salesController.importSales
};