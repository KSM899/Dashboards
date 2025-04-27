// src/components/common/ImportDataModal.jsx
import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { hasPermission } from '../../services/authService';
import apiService from '../../services/apiService';

const ImportDataModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mappings, setMappings] = useState({});
  const [preview, setPreview] = useState([]);
  const [showMappings, setShowMappings] = useState(false);
  const [importType, setImportType] = useState('sales');
  const fileInputRef = useRef(null);
  
  // Check if user has import permission
  const canImportData = hasPermission('IMPORT_DATA');
  
  if (!canImportData) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Import Data</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle size={20} className="mr-2" />
              <p>You don't have permission to import data.</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Function to handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError('');
    setSuccess(false);
    
    // Parse CSV preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const rows = csvText.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        
        // Generate preview
        const previewData = [];
        for (let i = 1; i < Math.min(6, rows.length); i++) {
          if (rows[i].trim() === '') continue;
          
          const values = rows[i].split(',');
          const rowData = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index]?.trim() || '';
          });
          
          previewData.push(rowData);
        }
        
        setPreview(previewData);
        
        // Auto-generate mappings based on headers
        const suggestedMappings = {};
        if (importType === 'sales') {
          // Map common sales column names
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('invoice') || lowerHeader.includes('id')) {
              suggestedMappings[header] = 'invoice_id';
            } else if (lowerHeader.includes('date')) {
              suggestedMappings[header] = 'date';
            } else if (lowerHeader.includes('customer')) {
              suggestedMappings[header] = 'customer_id';
            } else if (lowerHeader.includes('unit') && lowerHeader.includes('sales')) {
              suggestedMappings[header] = 'sales_unit_id';
            } else if (lowerHeader.includes('material') || lowerHeader.includes('product')) {
              suggestedMappings[header] = 'material_id';
            } else if (lowerHeader.includes('quantity') || lowerHeader.includes('qty')) {
              suggestedMappings[header] = 'quantity';
            } else if (lowerHeader.includes('price')) {
              suggestedMappings[header] = 'price';
            } else if (lowerHeader.includes('net')) {
              suggestedMappings[header] = 'item_net';
            } else if (lowerHeader.includes('tax')) {
              suggestedMappings[header] = 'item_tax';
            } else if (lowerHeader.includes('gross')) {
              suggestedMappings[header] = 'item_gross';
            }
          });
        }
        
        setMappings(suggestedMappings);
        setShowMappings(true);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file.');
    };
    
    reader.readAsText(selectedFile);
  };

  // Function to handle mapping changes
  const handleMappingChange = (csvColumn, dbColumn) => {
    setMappings(prev => ({
      ...prev,
      [csvColumn]: dbColumn
    }));
  };

  // Function to handle import type change
  const handleImportTypeChange = (type) => {
    setImportType(type);
    setFile(null);
    setPreview([]);
    setMappings({});
    setShowMappings(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to handle file upload and import
  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }
    
    // Validate mappings
    const requiredFields = importType === 'sales' 
      ? ['invoice_id', 'date', 'item_net'] 
      : ['id', 'name'];
      
    const mappedFields = Object.values(mappings);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      setError(`Missing required field mappings: ${missingRequired.join(', ')}`);
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mappings', JSON.stringify(mappings));
      formData.append('importType', importType);
      
      // Call API to import data
      let response;
      if (importType === 'sales') {
        response = await apiService.sales.import(formData);
      } else if (importType === 'products') {
        response = await apiService.products.import(formData);
      } else if (importType === 'customers') {
        response = await apiService.customers.import(formData);
      } else if (importType === 'targets') {
        response = await apiService.targets.import(formData);
      }
      
      if (response.success) {
        setSuccess(true);
        
        // Call onSuccess callback with import results
        if (onSuccess) {
          onSuccess({
            type: importType,
            count: response.importedCount || 0,
            message: response.message
          });
        }
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.error || 'Import failed. Please try again.');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError('Error during import. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Get database field options based on import type
  const getFieldOptions = () => {
    switch (importType) {
      case 'sales':
        return [
          { value: 'invoice_id', label: 'Invoice ID' },
          { value: 'company_id', label: 'Company ID' },
          { value: 'tax_country_code', label: 'Tax Country Code' },
          { value: 'tax_code', label: 'Tax Code' },
          { value: 'customer_id', label: 'Customer ID' },
          { value: 'date', label: 'Date' },
          { value: 'sales_unit_id', label: 'Sales Unit ID' },
          { value: 'site_id', label: 'Site ID' },
          { value: 'logistics_area', label: 'Logistics Area' },
          { value: 'type', label: 'Type' },
          { value: 'material_id', label: 'Material ID' },
          { value: 'adg', label: 'ADG' },
          { value: 'quantity', label: 'Quantity' },
          { value: 'identified_stock_id', label: 'Identified Stock ID' },
          { value: 'currency', label: 'Currency' },
          { value: 'unit_code', label: 'Unit Code' },
          { value: 'price', label: 'Price' },
          { value: 'discount', label: 'Discount' },
          { value: 'freight', label: 'Freight' },
          { value: 'item_net', label: 'Item Net' },
          { value: 'item_tax', label: 'Item Tax' },
          { value: 'item_gross', label: 'Item Gross' },
          { value: 'total_net_per_invoice', label: 'Total Net Per Invoice' },
          { value: 'total_tax_per_invoice', label: 'Total Tax Per Invoice' },
          { value: 'total_gross_per_invoice', label: 'Total Gross Per Invoice' }
        ];
      case 'products':
        return [
          { value: 'id', label: 'Product ID' },
          { value: 'name', label: 'Product Name' },
          { value: 'category_id', label: 'Category ID' },
          { value: 'description', label: 'Description' },
          { value: 'unit_code', label: 'Unit Code' }
        ];
      case 'customers':
        return [
          { value: 'id', label: 'Customer ID' },
          { value: 'name', label: 'Customer Name' },
          { value: 'type', label: 'Customer Type' },
          { value: 'contact_person', label: 'Contact Person' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' }
        ];
      case 'targets':
        return [
          { value: 'target_type', label: 'Target Type' },
          { value: 'target_id', label: 'Target ID' },
          { value: 'period_start', label: 'Period Start' },
          { value: 'period_end', label: 'Period End' },
          { value: 'target_value', label: 'Target Value' },
          { value: 'currency', label: 'Currency' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Import Data</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4">
          {/* Import Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Import Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleImportTypeChange('sales')}
                className={`px-4 py-2 rounded-md ${
                  importType === 'sales' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Sales Data
              </button>
              <button
                onClick={() => handleImportTypeChange('products')}
                className={`px-4 py-2 rounded-md ${
                  importType === 'products' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => handleImportTypeChange('customers')}
                className={`px-4 py-2 rounded-md ${
                  importType === 'customers' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => handleImportTypeChange('targets')}
                className={`px-4 py-2 rounded-md ${
                  importType === 'targets' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Targets
              </button>
            </div>
          </div>
          
          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
            
            {!file ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    CSV file up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center p-4 border border-gray-300 rounded-md bg-gray-50">
                <File className="h-8 w-8 text-blue-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setMappings({});
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
          
          {/* Data Preview and Mapping */}
          {file && preview.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Data Preview</h4>
                <button
                  type="button"
                  onClick={() => setShowMappings(!showMappings)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  {showMappings ? (
                    <>
                      <ChevronUp size={16} className="mr-1" />
                      Hide Column Mappings
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="mr-1" />
                      Show Column Mappings
                    </>
                  )}
                </button>
              </div>
              
              {/* Column Mappings */}
              {showMappings && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-600 mb-3">
                    Map CSV columns to database fields:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {Object.keys(preview[0] || {}).map((csvColumn) => (
                      <div key={csvColumn} className="flex items-center">
                        <div className="w-1/2 pr-2">
                          <p className="text-sm font-medium text-gray-700 truncate" title={csvColumn}>
                            {csvColumn}
                          </p>
                          <p className="text-xs text-gray-500 truncate" title={preview[0][csvColumn]}>
                            Example: {preview[0][csvColumn]}
                          </p>
                        </div>
                        <div className="w-1/2">
                          <select
                            value={mappings[csvColumn] || ''}
                            onChange={(e) => handleMappingChange(csvColumn, e.target.value)}
                            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">-- Skip --</option>
                            {getFieldOptions().map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex items-start">
                    <HelpCircle size={16} className="text-blue-500 mr-2 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      Required fields marked in bold. Fields left as "Skip" will not be imported.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Data Preview Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.keys(row).map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 whitespace-nowrap text-sm text-gray-500"
                          >
                            {row[cell]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="mt-2 text-xs text-gray-500 italic">
                Showing preview of first {preview.length} rows. Full file will be imported.
              </p>
            </div>
          )}
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <AlertCircle size={20} className="text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-center">
                <Check size={20} className="text-green-500 mr-2" />
                <p className="text-sm text-green-700">Data imported successfully!</p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || uploading || success}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              ) : (
                'Import Data'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportDataModal;