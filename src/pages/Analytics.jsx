// src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SalesTrendsCard from '../components/dashboard/SalesTrendsCard';
import SalesByCategoryCard from '../components/dashboard/SalesByCategoryCard';
import SalesByRegionCard from '../components/dashboard/SalesByRegionCard';
import { 
  groupSalesByDimension,
  processTimeSeriesData,
  filterData
} from '../utils/dataProcessing';
import AdvancedFilters from '../components/common/AdvancedFilters';
import ExportOptions from '../components/common/ExportOptions';

// In a real application, these would be API calls
const fetchSalesData = () => {
  // This simulates the API call - same as in Dashboard.jsx for now
  return Promise.resolve([
    // Sample invoices for demo
    {
      "Invoice ID": "INV-10115-250331_1",
      "Company ID": "10000",
      "Customer-ID": "BACS10000",
      "Customer Name": "Cash Customer",
      "Date": "2025-03-31",
      "Sales Unit": "10115",
      "Sales Unit Name": "North Region",
      "Material-ID": "1571",
      "Material Name": "Premium Widget A",
      "Category": "Widgets",
      "Quantity": 5,
      "Price": 191.8,
      "Item Net": 187414.7
    },
    {
      "Invoice ID": "INV-10116-250329_1",
      "Company ID": "10000",
      "Customer-ID": "RECS10001",
      "Customer Name": "Regular Customer",
      "Date": "2025-03-29",
      "Sales Unit": "10116",
      "Sales Unit Name": "South Region",
      "Material-ID": "1571",
      "Material Name": "Premium Widget A",
      "Category": "Widgets",
      "Quantity": 8,
      "Price": 191.8,
      "Item Net": 145000
    },
    {
      "Invoice ID": "INV-10117-250328_1",
      "Company ID": "10000",
      "Customer-ID": "ENTC10002",
      "Customer Name": "Enterprise Client",
      "Date": "2025-03-28",
      "Sales Unit": "10117",
      "Sales Unit Name": "East Region",
      "Material-ID": "1680",
      "Material Name": "Advanced Service C",
      "Category": "Services",
      "Quantity": 1,
      "Price": 3200.5,
      "Item Net": 95000
    },
    {
      "Invoice ID": "INV-10118-250325_1",
      "Company ID": "10000",
      "Customer-ID": "PARS10003",
      "Customer Name": "Partner Sale",
      "Date": "2025-03-25",
      "Sales Unit": "10118",
      "Sales Unit Name": "West Region",
      "Material-ID": "1650",
      "Material Name": "Enterprise Solution B",
      "Category": "Solutions",
      "Quantity": 2,
      "Price": 1705.2,
      "Item Net": 120000
    },
    {
      "Invoice ID": "INV-10119-250322_1",
      "Company ID": "10000",
      "Customer-ID": "DIGI10004",
      "Customer Name": "Digital Corp",
      "Date": "2025-03-22",
      "Sales Unit": "10117",
      "Sales Unit Name": "East Region",
      "Material-ID": "1630",
      "Material Name": "Support Package D",
      "Category": "Services",
      "Quantity": 3,
      "Price": 850,
      "Item Net": 76000
    },
    {
      "Invoice ID": "INV-10120-250320_1",
      "Company ID": "10000",
      "Customer-ID": "GLOB10005",
      "Customer Name": "Global Industries",
      "Date": "2025-03-20",
      "Sales Unit": "10115",
      "Sales Unit Name": "North Region",
      "Material-ID": "1650",
      "Material Name": "Enterprise Solution B",
      "Category": "Solutions",
      "Quantity": 1,
      "Price": 1705.2,
      "Item Net": 83000
    },
    {
      "Invoice ID": "INV-10121-250318_1",
      "Company ID": "10000",
      "Customer-ID": "TECH10006",
      "Customer Name": "Tech Innovators",
      "Date": "2025-03-18",
      "Sales Unit": "10116",
      "Sales Unit Name": "South Region",
      "Material-ID": "1590",
      "Material Name": "Basic Widget E",
      "Category": "Widgets",
      "Quantity": 25,
      "Price": 45.5,
      "Item Net": 68000
    },
    {
      "Invoice ID": "INV-10122-250315_1",
      "Company ID": "10000",
      "Customer-ID": "RECS10001",
      "Customer Name": "Regular Customer",
      "Date": "2025-03-15",
      "Sales Unit": "10116",
      "Sales Unit Name": "South Region",
      "Material-ID": "1680",
      "Material Name": "Advanced Service C",
      "Category": "Services",
      "Quantity": 1,
      "Price": 3200.5,
      "Item Net": 92000
    }
  ]);
};

const Analytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date('2025-03-01'),
      end: new Date('2025-03-31')
    },
    category: 'all',
    salesUnit: 'all',
    customer: 'all',
    product: 'all'
  });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sales = await fetchSalesData();
        setSalesData(sales);
        
        // Apply initial filters
        const filtered = filterData(sales, filters);
        setFilteredData(filtered);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // In a real app, show error notification
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [refreshKey]);

  // Apply filters when they change
  useEffect(() => {
    const filtered = filterData(salesData, filters);
    setFilteredData(filtered);
  }, [salesData, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Process data for charts
  const timeSeriesData = filteredData.map(item => ({
    date: item.Date,
    value: item["Item Net"]
  }));

  const categorySalesData = groupSalesByDimension(filteredData, 'Category', 'Item Net');
  const regionSalesData = groupSalesByDimension(filteredData, 'Sales Unit Name', 'Item Net');

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>

          <div className="flex space-x-3">
            <button 
              onClick={refreshData}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh Data
            </button>
            
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center px-3 py-2 bg-blue-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Export Options Dropdown */}
        {showExportOptions && (
          <ExportOptions 
            data={filteredData} 
            onClose={() => setShowExportOptions(false)} 
          />
        )}
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <AdvancedFilters 
            filters={filters}
            salesData={salesData}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Visualizations */}
        <div className="mb-6">
          <SalesTrendsCard data={timeSeriesData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SalesByCategoryCard data={categorySalesData} />
          <SalesByRegionCard data={regionSalesData} />
        </div>
        
        {/* Detailed Data Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Detailed Sales Data</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-3 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, 100).map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-sm text-gray-900">{new Date(item.Date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{item["Invoice ID"]}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item["Customer Name"]}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item["Sales Unit Name"]}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item["Material Name"]}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.Category}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">{item.Quantity}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'OMR' }).format(item.Price)}</td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'OMR' }).format(item["Item Net"])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.length > 100 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Showing 100 of {filteredData.length} records. Export the data to see all records.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;