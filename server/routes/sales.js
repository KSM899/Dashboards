// server/routes/sales.js

const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const fileUpload = require('../middleware/fileUpload');

/**
 * @route GET /api/sales
 * @desc Get all sales with filtering
 * @access Private
 */
router.get('/', auth, salesController.getAllSales);

/**
 * @route GET /api/sales/summary
 * @desc Get sales summary metrics
 * @access Private
 */
router.get('/summary', auth, salesController.getSalesSummary);

/**
 * @route POST /api/sales/analytics
 * @desc Get sales analytics with grouping and aggregation
 * @access Private
 */
router.post('/analytics', auth, salesController.getSalesAnalytics);

/**
 * @route GET /api/sales/:id
 * @desc Get sale by invoice ID
 * @access Private
 */
router.get('/:id', auth, salesController.getSaleById);

/**
 * @route POST /api/sales
 * @desc Create new sale
 * @access Private (Admin, Manager only)
 */
router.post('/', auth, rbac('admin', 'manager'), salesController.createSale);

/**
 * @route PUT /api/sales/:id
 * @desc Update a sale
 * @access Private (Admin, Manager only)
 */
router.put('/:id', auth, rbac('admin', 'manager'), salesController.updateSale);

/**
 * @route DELETE /api/sales/:id
 * @desc Delete a sale
 * @access Private (Admin only)
 */
router.delete('/:id', auth, rbac('admin'), salesController.deleteSale);

/**
 * @route POST /api/sales/export
 * @desc Export sales data
 * @access Private
 */
router.post('/export', auth, salesController.exportSales);

/**
 * @route POST /api/sales/import
 * @desc Import sales data from CSV
 * @access Private (Admin, Manager only)
 */
router.post('/import', 
  auth, 
  rbac('admin', 'manager'),
  fileUpload.csv(),
  fileUpload.handleError,
  salesController.importSales
);

module.exports = router;