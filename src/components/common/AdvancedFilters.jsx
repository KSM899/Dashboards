// src/components/common/AdvancedFilters.jsx - Fixed version

import React, { useState, useEffect } from 'react';
import { Calendar, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getUniqueValues } from '../../utils/dataProcessing';

const DateRangeSelector = ({ dateRange, onDateRangeChange }) => {
  // Ensure dateRange has default values to prevent the error
  const safeDateRange = dateRange || {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date() // Today
  };

  const [startDate, setStartDate] = useState(safeDateRange.start.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(safeDateRange.end.toISOString().split('T')[0]);
  const [selectedPreset, setSelectedPreset] = useState('custom');

  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'lastWeek', label: 'Last Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisQuarter', label: 'This Quarter' },
    { id: 'lastQuarter', label: 'Last Quarter' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'lastYear', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const applyPreset = (presetId) => {
    setSelectedPreset(presetId);
    
    const today = new Date();
    let start, end;
    
    switch (presetId) {
      case 'today':
        start = new Date();
        end = new Date();
        break;
      case 'yesterday':
        start = new Date();
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case 'thisWeek':
        start = new Date();
        start.setDate(start.getDate() - start.getDay());
        end = new Date();
        break;
      case 'lastWeek':
        start = new Date();
        start.setDate(start.getDate() - start.getDay() - 7);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date();
        break;
      case 'lastQuarter':
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        start = new Date(year, adjustedQuarter * 3, 1);
        end = new Date(year, adjustedQuarter * 3 + 3, 0);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
      default:
        // Keep current custom dates
        return;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    onDateRangeChange({
      start,
      end
    });
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    setSelectedPreset('custom');
    
    onDateRangeChange({
      start: new Date(newStartDate),
      end: safeDateRange.end
    });
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    setSelectedPreset('custom');
    
    onDateRangeChange({
      start: safeDateRange.start,
      end: new Date(newEndDate)
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center">
        <Calendar size={18} className="text-gray-500 mr-2" />
        <select 
          value={selectedPreset}
          onChange={(e) => applyPreset(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          {presets.map(preset => (
            <option key={preset.id} value={preset.id}>{preset.label}</option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
    </div>
  );
};

const AdvancedFilters = ({ filters, salesData, onFilterChange, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Ensure filters object has all required properties with defaults
  const safeFilters = {
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date()
    },
    category: 'all',
    salesUnit: 'all',
    customer: 'all',
    product: 'all',
    ...filters
  };

  // Extract unique values for filter options on component mount
  useEffect(() => {
    if (salesData && salesData.length > 0) {
      setCategories(getUniqueValues(salesData, 'Category'));
      setRegions(getUniqueValues(salesData, 'Sales Unit Name'));
      setCustomers(getUniqueValues(salesData, 'Customer Name'));
      setProducts(getUniqueValues(salesData, 'Material Name'));
    }
  }, [salesData]);

  const handleDateRangeChange = (dateRange) => {
    onFilterChange({ dateRange });
  };

  const handleSelectChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      category: 'all',
      salesUnit: 'all',
      customer: 'all',
      product: 'all'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <X size={16} className="mr-1" />
            Clear filters
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Show more filters
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <DateRangeSelector 
          dateRange={safeFilters.dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
        
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isExpanded ? 'block' : 'hidden'}`}>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={safeFilters.category}
              onChange={(e) => handleSelectChange('category', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              id="region"
              value={safeFilters.salesUnit}
              onChange={(e) => handleSelectChange('salesUnit', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="all">All Regions</option>
              {regions.map((region, index) => (
                <option key={index} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              id="customer"
              value={safeFilters.customer}
              onChange={(e) => handleSelectChange('customer', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="all">All Customers</option>
              {customers.map((customer, index) => (
                <option key={index} value={customer}>{customer}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              id="product"
              value={safeFilters.product}
              onChange={(e) => handleSelectChange('product', e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="all">All Products</option>
              {products.map((product, index) => (
                <option key={index} value={product}>{product}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;