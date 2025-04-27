// src/pages/ImportDataPage.jsx
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check, X, ArrowDown, FileText, FileType2, Users } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ImportDataModal from '../components/common/ImportDataModal';
import { useNotification } from '../context/NotificationContext';
import { useData } from '../context/DataContext';

const ImportDataPage = () => {
  const { refreshData } = useData();
  const { success, error, info } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState(null);
  const [importHistory, setImportHistory] = useState([
    {
      id: 1,
      type: 'sales',
      filename: 'sales_data_march_2025.csv',
      timestamp: '2025-04-10T14:30:00Z',
      status: 'success',
      count: 156,
      errors: 0,
      importedBy: 'Admin User'
    },
    {
      id: 2,
      type: 'products',
      filename: 'product_catalog_update.csv',
      timestamp: '2025-04-08T09:15:00Z',
      status: 'success',
      count: 24,
      errors: 0,
      importedBy: 'Manager User'
    },
    {
      id: 3,
      type: 'sales',
      filename: 'q1_sales_data.csv',
      timestamp: '2025-04-02T11:45:00Z',
      status: 'partial',
      count: 187,
      errors: 12,
      importedBy: 'Admin User'
    },
    {
      id: 4,
      type: 'customers',
      filename: 'new_customers.csv',
      timestamp: '2025-03-27T16:20:00Z',
      status: 'failed',
      count: 0,
      errors: 1,
      importedBy: 'Manager User'
    }
  ]);

  // Open the import modal with specific type
  const openImportModal = (type) => {
    setSelectedImportType(type);
    setIsModalOpen(true);
  };

  // Handle successful import
  const handleImportSuccess = (result) => {
    setIsModalOpen(false);
    
    // Add to import history
    const newImportRecord = {
      id: Date.now(),
      type: result.type,
      filename: result.filename || `import_${Date.now()}.csv`,
      timestamp: new Date().toISOString(),
      status: result.errorCount > 0 ? 'partial' : 'success',
      count: result.importedCount,
      errors: result.errorCount,
      importedBy: 'Current User' // In a real app, get from auth context
    };
    
    setImportHistory([newImportRecord, ...importHistory]);
    
    // Show success notification
    success(
      `Successfully imported ${result.importedCount} ${result.type} records${result.errorCount > 0 ? ` with ${result.errorCount} errors` : ''}`,
      { 
        title: 'Import Complete',
        duration: 5000 
      }
    );
    
    // Refresh data to reflect changes
    refreshData();
  };

  // Handle import error
  const handleImportError = (errorMsg) => {
    error(errorMsg || 'Failed to import data. Please check your file and try again.', {
      title: 'Import Failed',
      duration: 8000 // Longer duration for errors
    });
  };

  // Get icon for import type
  const getImportTypeIcon = (type) => {
    switch (type) {
      case 'sales':
        return <FileSpreadsheet className="h-8 w-8 text-blue-500" />;
      case 'products':
        return <FileType2 className="h-8 w-8 text-green-500" />;
      case 'customers':
        return <Users className="h-8 w-8 text-purple-500" />;
      case 'targets':
        return <FileText className="h-8 w-8 text-orange-500" />;
      default:
        return <FileSpreadsheet className="h-8 w-8 text-gray-500" />;
    }
  };

  // Get status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">Success</span>;
      case 'partial':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">Partial</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">Unknown</span>;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Import Data</h1>

        {/* Import Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => openImportModal('sales')}>
            <div className="flex flex-col items-center text-center">
              <FileSpreadsheet className="h-12 w-12 text-blue-500 mb-3" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Sales Data</h2>
              <p className="text-sm text-gray-500 mb-4">Import sales transactions, invoices and order data</p>
              <button className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                <Upload size={16} className="mr-1" />
                Import Sales
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => openImportModal('products')}>
            <div className="flex flex-col items-center text-center">
              <FileType2 className="h-12 w-12 text-green-500 mb-3" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Products</h2>
              <p className="text-sm text-gray-500 mb-4">Update product catalog, prices and inventory information</p>
              <button className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                <Upload size={16} className="mr-1" />
                Import Products
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => openImportModal('customers')}>
            <div className="flex flex-col items-center text-center">
              <Users className="h-12 w-12 text-purple-500 mb-3" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Customers</h2>
              <p className="text-sm text-gray-500 mb-4">Import customer profiles, contacts and account details</p>
              <button className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                <Upload size={16} className="mr-1" />
                Import Customers
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => openImportModal('targets')}>
            <div className="flex flex-col items-center text-center">
              <FileText className="h-12 w-12 text-orange-500 mb-3" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Targets</h2>
              <p className="text-sm text-gray-500 mb-4">Set sales targets for different periods, regions and reps</p>
              <button className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm">
                <Upload size={16} className="mr-1" />
                Import Targets
              </button>
            </div>
          </div>
        </div>

        {/* Import Guidance */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <ArrowDown size={24} className="text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Import Guidelines</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use CSV format with headers in the first row</li>
                  <li>Maximum file size: 10MB</li>
                  <li>For sales data, include at least Invoice ID, Date, and Amount</li>
                  <li>For products, include Product ID and Name</li>
                  <li>Make sure all required fields are populated</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Import History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Import History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imported By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getImportTypeIcon(item.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.count} imported</div>
                      {item.errors > 0 && (
                        <div className="text-xs text-red-500">{item.errors} errors</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.importedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {isModalOpen && (
        <ImportDataModal
          initialImportType={selectedImportType}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleImportSuccess}
          onError={handleImportError}
        />
      )}
    </DashboardLayout>
  );
};

export default ImportDataPage;