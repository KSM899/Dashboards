// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, ChevronDown, ChevronUp, Plus, Trash2, Play } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { hasPermission } from '../services/authService';
import AdvancedFilters from '../components/common/AdvancedFilters';

// In a real application, these would be API calls
const fetchReportTemplates = () => {
  // This simulates the API call
  return Promise.resolve([
    { 
      id: 1, 
      name: 'Monthly Sales Summary', 
      description: 'Summary of sales by region, category, and sales rep',
      type: 'summary',
      lastRun: '2025-04-05T10:30:00Z',
      createdBy: 'Admin User',
      schedule: 'monthly',
      filters: {
        dateRange: { preset: 'thisMonth' },
        groupBy: ['region', 'category']
      }
    },
    { 
      id: 2, 
      name: 'Product Performance Analysis', 
      description: 'Detailed analysis of product sales and performance metrics',
      type: 'detailed',
      lastRun: '2025-04-01T14:15:00Z',
      createdBy: 'Manager User',
      schedule: null,
      filters: {
        dateRange: { preset: 'lastQuarter' },
        groupBy: ['product', 'category']
      }
    },
    { 
      id: 3, 
      name: 'Sales Rep Performance', 
      description: 'Performance metrics for all sales representatives',
      type: 'performance',
      lastRun: '2025-03-28T09:00:00Z',
      createdBy: 'Admin User',
      schedule: 'weekly',
      filters: {
        dateRange: { preset: 'thisQuarter' },
        groupBy: ['salesRep', 'region']
      }
    },
    { 
      id: 4, 
      name: 'Customer Purchase Patterns', 
      description: 'Analysis of customer buying patterns and frequency',
      type: 'analysis',
      lastRun: null,
      createdBy: 'Manager User',
      schedule: null,
      filters: {
        dateRange: { preset: 'thisYear' },
        groupBy: ['customer', 'product']
      }
    }
  ]);
};

const fetchSalesData = () => {
  // This simulates the API call - same as in Dashboard.jsx for now
  return Promise.resolve([
    // Sample data here (same as used in other components)
  ]);
};

const Reports = () => {
  const [reportTemplates, setReportTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customReport, setCustomReport] = useState({
    name: '',
    description: '',
    type: 'summary',
    filters: {
      dateRange: {
        start: new Date('2025-03-01'),
        end: new Date('2025-03-31')
      },
      category: 'all',
      salesUnit: 'all',
      customer: 'all',
      product: 'all',
      groupBy: ['category', 'region']
    }
  });
  const [salesData, setSalesData] = useState([]);
  const [expandedTemplates, setExpandedTemplates] = useState({});
  const [showNewReport, setShowNewReport] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user has export permission
  const canExportReports = hasPermission('EXPORT_DATA');

  // Fetch templates and sales data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [templates, sales] = await Promise.all([
          fetchReportTemplates(),
          fetchSalesData()
        ]);
        setReportTemplates(templates);
        setSalesData(sales);
      } catch (error) {
        console.error('Error loading report data:', error);
        // In a real app, show error notification
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const toggleTemplateExpanded = (templateId) => {
    setExpandedTemplates(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowNewReport(false);
    setReportResult(null);
  };

  const handleStartNewReport = () => {
    setSelectedTemplate(null);
    setShowNewReport(true);
    setReportResult(null);
  };

  const handleCustomReportFilterChange = (filters) => {
    setCustomReport(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      }
    }));
  };

  const handleCustomReportInputChange = (field, value) => {
    setCustomReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGroupByToggle = (group) => {
    setCustomReport(prev => {
      const currentGroups = prev.filters.groupBy || [];
      const newGroups = currentGroups.includes(group)
        ? currentGroups.filter(g => g !== group)
        : [...currentGroups, group];
      
      return {
        ...prev,
        filters: {
          ...prev.filters,
          groupBy: newGroups
        }
      };
    });
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    setReportResult(null);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // Mock report generation
      const reportData = {
        title: selectedTemplate ? selectedTemplate.name : customReport.name,
        generatedAt: new Date().toISOString(),
        summary: {
          totalSales: 866414.7,
          itemsAnalyzed: 8,
          dateRange: {
            start: new Date('2025-03-01').toLocaleDateString(),
            end: new Date('2025-03-31').toLocaleDateString()
          }
        },
        charts: ['SalesByCategory', 'SalesByRegion', 'SalesTrend'],
        data: salesData // In a real app, this would be processed data
      };
      
      setReportResult(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      // In a real app, show error notification
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const downloadReport = (format) => {
    // In a real app, this would trigger a download
    console.log(`Downloading report in ${format} format`, reportResult);
    alert(`Report would be downloaded in ${format} format in a real application.`);
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'summary': return 'Summary Report';
      case 'detailed': return 'Detailed Report';
      case 'performance': return 'Performance Analysis';
      case 'analysis': return 'Data Analysis';
      default: return 'Custom Report';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

          <button
            onClick={handleStartNewReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            New Custom Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Report Templates</h2>
              </div>
              
              <div className="p-4">
                <ul className="divide-y divide-gray-200">
                  {reportTemplates.map((template) => (
                    <li key={template.id} className="py-3">
                      <div 
                        className={`flex justify-between items-start cursor-pointer ${
                          selectedTemplate?.id === template.id ? 'text-blue-600' : 'text-gray-900'
                        }`}
                        onClick={() => toggleTemplateExpanded(template.id)}
                      >
                        <div className="flex items-center">
                          <FileText size={18} className="mr-2" />
                          <span className="font-medium">{template.name}</span>
                        </div>
                        {expandedTemplates[template.id] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                      
                      {expandedTemplates[template.id] && (
                        <div className="mt-2 pl-7">
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Type: {getReportTypeLabel(template.type)}</p>
                            <p>Created by: {template.createdBy}</p>
                            <p>Last run: {template.lastRun ? new Date(template.lastRun).toLocaleString() : 'Never'}</p>
                            <p>Schedule: {template.schedule ? template.schedule.charAt(0).toUpperCase() + template.schedule.slice(1) : 'Not scheduled'}</p>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTemplate(template);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Run this report
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {/* Report Configuration Panel */}
            {(selectedTemplate || showNewReport) && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedTemplate 
                      ? `Configure Report: ${selectedTemplate.name}` 
                      : 'Create New Report'}
                  </h2>
                </div>
                
                <div className="p-6">
                  {showNewReport && (
                    <div className="mb-6 space-y-4">
                      <div>
                        <label htmlFor="reportName" className="block text-sm font-medium text-gray-700">Report Name</label>
                        <input
                          type="text"
                          id="reportName"
                          value={customReport.name}
                          onChange={(e) => handleCustomReportInputChange('name', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., Q1 Sales Analysis"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          id="reportDescription"
                          value={customReport.description}
                          onChange={(e) => handleCustomReportInputChange('description', e.target.value)}
                          rows={2}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Brief description of the report purpose"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">Report Type</label>
                        <select
                          id="reportType"
                          value={customReport.type}
                          onChange={(e) => handleCustomReportInputChange('type', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="summary">Summary Report</option>
                          <option value="detailed">Detailed Report</option>
                          <option value="performance">Performance Analysis</option>
                          <option value="analysis">Data Analysis</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Filters and Parameters</h3>
                    <AdvancedFilters 
                      filters={selectedTemplate?.filters || customReport.filters}
                      salesData={salesData}
                      onFilterChange={handleCustomReportFilterChange}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Group By</h3>
                    <div className="flex flex-wrap gap-2">
                      {['category', 'region', 'product', 'customer', 'date', 'salesRep'].map((group) => (
                        <button
                          key={group}
                          onClick={() => handleGroupByToggle(group)}
                          className={`px-3 py-1 text-sm rounded-full ${
                            (selectedTemplate?.filters?.groupBy || customReport.filters.groupBy).includes(group)
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {group.charAt(0).toUpperCase() + group.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={generateReport}
                      disabled={isGeneratingReport}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingReport ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play size={18} className="mr-2" />
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Report Results Panel */}
            {reportResult && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Report Results: {reportResult.title}
                  </h2>
                  
                  {canExportReports && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport('pdf')}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                      >
                        <Download size={16} className="mr-1" />
                        PDF
                      </button>
                      <button
                        onClick={() => downloadReport('excel')}
                        className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                      >
                        <Download size={16} className="mr-1" />
                        Excel
                      </button>
                      <button
                        onClick={() => downloadReport('csv')}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                      >
                        <Download size={16} className="mr-1" />
                        CSV
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Sales</h3>
                        <p className="text-2xl font-bold text-gray-900">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(reportResult.summary.totalSales)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Items Analyzed</h3>
                        <p className="text-2xl font-bold text-gray-900">{reportResult.summary.itemsAnalyzed}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date Range</h3>
                        <p className="text-sm font-medium text-gray-900">
                          {reportResult.summary.dateRange.start} - {reportResult.summary.dateRange.end}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Report Overview</h3>
                    <p className="text-sm text-gray-600">
                      This report was generated on {new Date(reportResult.generatedAt).toLocaleString()} and includes
                      sales data for the period specified. The analysis focuses on the selected metrics
                      and groupings.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Charts & Visualizations</h3>
                    <div className="bg-gray-100 p-8 rounded-lg flex items-center justify-center text-gray-500">
                      <p>Charts and visualizations would appear here in a real application.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Data</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Region
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportResult.data.slice(0, 5).map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(item.Date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item["Customer Name"]}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item["Sales Unit Name"]}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item["Material Name"]}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.Quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item["Item Net"])}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {reportResult.data.length > 5 && (
                        <div className="text-center py-4 text-sm text-gray-500">
                          Showing 5 of {reportResult.data.length} records. Export the report to see all records.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {!selectedTemplate && !showNewReport && !reportResult && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-8 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Selected</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Select a report template from the list or create a new custom report to get started.
                  </p>
                  <button
                    onClick={handleStartNewReport}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
                  >
                    <Plus size={18} className="mr-2" />
                    Create New Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;