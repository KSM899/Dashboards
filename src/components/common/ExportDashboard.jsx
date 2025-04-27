// src/components/common/ExportDashboard.jsx

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X, Check, Image } from 'lucide-react';
import { formatCurrency } from '../../utils/dataProcessing';
import { hasPermission } from '../../services/authService';
import { useData } from '../../context/DataContext';

const ExportDashboard = ({ onClose }) => {
  const { filteredSalesData, summaryMetrics, filters } = useData();
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    salesByCategory: true,
    salesByRegion: true,
    salesTrends: true,
    topProducts: true,
    topCustomers: true,
    salesByRep: true
  });
  const [loading, setLoading] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  
  // Check if user has export permission
  const canExport = hasPermission('EXPORT_DATA');
  
  if (!canExport) {
    return (
      <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10 w-80">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-900">Export Dashboard</h3>
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
  
  const toggleSection = (section) => {
    setIncludeSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const selectAllSections = () => {
    const allSelected = Object.values(includeSections).every(Boolean);
    
    const newState = {};
    Object.keys(includeSections).forEach(key => {
      newState[key] = !allSelected;
    });
    
    setIncludeSections(newState);
  };
  
  const exportDashboard = async () => {
    setLoading(true);
    setExportComplete(false);
    
    try {
      // Create file name with date
      const today = new Date().toISOString().split('T')[0];
      const fileName = `sales_dashboard_${today}`;
      
      // Perform export based on format
      switch (exportFormat) {
        case 'csv':
          await exportCSV(fileName);
          break;
        case 'excel':
          await exportExcel(fileName);
          break;
        case 'pdf':
          await exportPDF(fileName);
          break;
        case 'image':
          await exportImage(fileName);
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const exportCSV = async (fileName) => {
    if (!filteredSalesData || filteredSalesData.length === 0) {
      alert('No data available to export.');
      return;
    }
    
    // Get headers from the first data object
    const firstItem = filteredSalesData[0];
    const headers = Object.keys(firstItem);
    
    // Create CSV rows
    const dataRows = filteredSalesData.map(item => {
      return headers.map(header => {
        let value = item[header];
        
        // Format dates
        if (header === 'Date' && value) {
          value = new Date(value).toISOString().split('T')[0];
        }
        
        // Ensure values with commas are quoted
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        
        return value !== undefined && value !== null ? value : '';
      }).join(',');
    });
    
    // Create final CSV content
    const csvContent = [
      headers.join(','),
      ...dataRows
    ].join('\n');
    
    // Create and download file
    downloadFile(csvContent, fileName, 'csv', 'text/csv;charset=utf-8;');
  };
  
  const exportExcel = async (fileName) => {
    // In a real app, you would use a library like SheetJS/xlsx or exceljs
    // For this demo, we'll simulate by exporting CSV
    alert('In a production environment, this would export an Excel file using a library like SheetJS. For now, exporting as CSV instead.');
    await exportCSV(fileName);
  };
  
  const exportPDF = async (fileName) => {
    // In a real app, this would use a library like jsPDF or pdfmake
    alert('PDF export would be implemented with a library like jsPDF or pdfmake. This is a placeholder for the actual implementation.');
    
    // Example implementation with jsPDF would look like:
    /*
    import jsPDF from 'jspdf';
    import 'jspdf-autotable';
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Sales Dashboard Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    if (includeSections.summary) {
      doc.setFontSize(14);
      doc.text('Summary Metrics', 14, 40);
      
      // Add summary metrics table
      doc.autoTable({
        head: [['Metric', 'Value']],
        body: [
          ['Total Sales', summaryMetrics.formattedTotalSales],
          ['Number of Orders', summaryMetrics.itemCount.toString()],
          ['Average Sale', summaryMetrics.formattedAverageSale],
          ['Growth', `${summaryMetrics.growth.toFixed(1)}%`]
        ],
        startY: 45,
        theme: 'grid'
      });
    }
    
    // Add other sections similarly...
    
    // Save PDF
    doc.save(`${fileName}.pdf`);
    */
  };
  
  const exportImage = async (fileName) => {
    // In a real app, this would use html2canvas or a similar library
    alert('Image export would capture the dashboard as a PNG using a library like html2canvas. This is a placeholder for the actual implementation.');
    
    // Example implementation with html2canvas would look like:
    /*
    import html2canvas from 'html2canvas';
    
    const dashboardElement = document.getElementById('dashboard-container');
    
    const canvas = await html2canvas(dashboardElement, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imageUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${fileName}.png`;
    link.click();
    */
  };
  
  const downloadFile = (content, fileName, extension, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.${extension}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Export Dashboard</h3>
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
            onClick={() => setExportFormat('excel')}
            className={`flex items-center px-3 py-2 rounded text-sm ${
              exportFormat === 'excel' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Excel
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
          <button
            onClick={() => setExportFormat('image')}
            className={`flex items-center px-3 py-2 rounded text-sm ${
              exportFormat === 'image' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <Image size={16} className="mr-2" />
            Image
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Include Sections</label>
          <button 
            onClick={selectAllSections}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {Object.values(includeSections).every(Boolean) ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="section-summary"
              checked={includeSections.summary}
              onChange={() => toggleSection('summary')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="section-summary" className="ml-2 text-sm text-gray-700">
              Summary Metrics
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="section-salesByCategory"
              checked={includeSections.salesByCategory}
              onChange={() => toggleSection('salesByCategory')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="section-salesByCategory" className="ml-2 text-sm text-gray-700">
              Sales by Category
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="section-salesByRegion"
              checked={includeSections.salesByRegion}
              onChange={() => toggleSection('salesByRegion')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="section-salesByRegion" className="ml-2 text-sm text-gray-700">
              Sales by Region
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="section-salesTrends"
              checked={includeSections.salesTrends}
              onChange={() => toggleSection('salesTrends')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="section-salesTrends" className="ml-2 text-sm text-gray-700">
              Sales Trends
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="section-topProducts"
              checked={includeSections.topProducts}
              onChange={() => toggleSection('topProducts')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="section-topProducts" className="ml-2 text-sm text-gray-700">
              Top Products
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="section-topCustomers"
              checked={includeSections.topCustomers}
              onChange={() => toggleSection('topCustomers')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="section-topCustomers" className="ml-2 text-sm text-gray-700">
              Top Customers
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="section-salesByRep"
              checked={includeSections.salesByRep}
              onChange={() => toggleSection('salesByRep')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="section-salesByRep" className="ml-2 text-sm text-gray-700">
              Sales by Rep
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-xs text-gray-500">
          {filteredSalesData?.length || 0} records selected
        </div>
        <button
          onClick={exportDashboard}
          disabled={loading || !Object.values(includeSections).some(Boolean)}
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading || !Object.values(includeSections).some(Boolean)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : exportComplete
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-1">⟳</span> Exporting...
            </>
          ) : exportComplete ? (
            <>
              <Check size={16} className="inline-block mr-1" /> Exported
            </>
          ) : (
            <>
              <Download size={16} className="inline-block mr-1" /> Export
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportDashboard;