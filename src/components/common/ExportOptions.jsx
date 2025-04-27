// src/components/common/ExportOptions.jsx
import React, { useState } from 'react';
import { FileText, FileSpreadsheet, X, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/dataProcessing';
import { hasPermission } from '../../services/authService';

const ExportOptions = ({ data, onClose }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportColumns, setExportColumns] = useState({
    date: true,
    invoiceId: true,
    customer: true,
    region: true,
    product: true,
    category: true,
    quantity: true,
    price: true,
    total: true
  });
  const [loading, setLoading] = useState(false);
  
  // Check if user has export permission
  const canExport = hasPermission('EXPORT_DATA');
  
  if (!canExport) {
    return (
      <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10 w-80">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-900">Export Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-red-500">
          You don't have permission to export data. Please contact your administrator.
        </p>
      </div>
    );
  }
  
  const toggleColumn = (column) => {
    setExportColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };
  
  const selectAllColumns = () => {
    const allSelected = Object.keys(exportColumns).every(key => exportColumns[key]);
    
    const newState = {};
    Object.keys(exportColumns).forEach(key => {
      newState[key] = !allSelected;
    });
    
    setExportColumns(newState);
  };
  
  // Maps internal column keys to data fields in the actual data
  const columnMapping = {
    date: { field: 'Date', label: 'Date' },
    invoiceId: { field: 'Invoice ID', label: 'Invoice ID' },
    customer: { field: 'Customer Name', label: 'Customer' },
    region: { field: 'Sales Unit Name', label: 'Region' },
    product: { field: 'Material Name', label: 'Product' },
    category: { field: 'Category', label: 'Category' },
    quantity: { field: 'Quantity', label: 'Quantity' },
    price: { field: 'Price', label: 'Price' },
    total: { field: 'Item Net', label: 'Total' }
  };
  
  const exportData = () => {
    setLoading(true);
    
    try {
      // Filter columns based on selection
      const selectedColumns = Object.entries(exportColumns)
        .filter(([_, selected]) => selected)
        .map(([key]) => key);
      
      if (selectedColumns.length === 0) {
        alert('Please select at least one column to export');
        setLoading(false);
        return;
      }
      
      if (exportFormat === 'csv') {
        exportCSV(selectedColumns);
      } else if (exportFormat === 'pdf') {
        exportPDF(selectedColumns);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
      onClose();
    }
  };
  
  const exportCSV = (selectedColumns) => {
    // Create CSV header row
    const headers = selectedColumns.map(key => columnMapping[key].label);
    
    // Create CSV data rows
    const rows = data.map(item => {
      return selectedColumns.map(key => {
        const field = columnMapping[key].field;
        let value = item[field];
        
        // Format date
        if (key === 'date' && value) {
          value = new Date(value).toLocaleDateString();
        }
        
        // Format currency
        if (['price', 'total'].includes(key) && value) {
          value = value.toString(); // Convert number to string without currency symbol
        }
        
        return value !== undefined && value !== null ? value : '';
      });
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportPDF = (selectedColumns) => {
    // In a real implementation, you would use a library like jsPDF or pdfmake
    // For this demo, we'll just show an alert
    alert('PDF export would be implemented with a library like jsPDF or pdfmake. This is just a demo.');
    
    // Example implementation with jsPDF would look something like this:
    /*
    import jsPDF from 'jspdf';
    import 'jspdf-autotable';
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Sales Data Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare table data
    const headers = selectedColumns.map(key => columnMapping[key].label);
    
    const rows = data.map(item => {
      return selectedColumns.map(key => {
        const field = columnMapping[key].field;
        let value = item[field];
        
        if (key === 'date' && value) {
          value = new Date(value).toLocaleDateString();
        }
        
        if (['price', 'total'].includes(key) && value) {
          value = formatCurrency(value);
        }
        
        return value !== undefined && value !== null ? value : '';
      });
    });
    
    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'grid'
    });
    
    // Save PDF
    doc.save(`sales_data_${new Date().toISOString().split('T')[0]}.pdf`);
    */
  };
  
  return (
    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Export Data</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setExportFormat('csv')}
            className={`flex items-center px-3 py-2 rounded text-sm ${
              exportFormat === 'csv' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <FileSpreadsheet size={16} className="mr-2" />
            CSV
          </button>
          <button
            onClick={() => setExportFormat('pdf')}
            className={`flex items-center px-3 py-2 rounded text-sm ${
              exportFormat === 'pdf' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <FileText size={16} className="mr-2" />
            PDF
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Columns</label>
          <button 
            onClick={selectAllColumns}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {Object.values(exportColumns).every(Boolean) ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(columnMapping).map(([key, { label }]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={`column-${key}`}
                checked={exportColumns[key]}
                onChange={() => toggleColumn(key)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`column-${key}`} className="ml-2 text-sm text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-xs text-gray-500">
          {data.length} records selected
        </div>
        <button
          onClick={exportData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
};

export default ExportOptions;