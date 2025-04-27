// src/context/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../services/apiService';
import { useNotification } from './NotificationContext';
import { formatCurrency, calculateGrowth, getUniqueValues } from '../utils/dataProcessing';

// Create context
const DataContext = createContext(null);

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for main data types
  const [salesData, setSalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [targets, setTargets] = useState({});
  const [settings, setSettings] = useState(null);
  const [salesReps, setSalesReps] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Access notification context
  const { error: showError, success: showSuccess } = useNotification();
  
  // Filters state with defaults
  const [filters, setFilters] = useState({
    category: 'all',
    salesUnit: 'all',
    customer: 'all',
    product: 'all',
    salesRep: 'all',
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
      end: new Date() // Today
    }
  });

  // Function to load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      const [salesResponse, targetsResponse, settingsResponse, salesRepsResponse] = await Promise.all([
        apiService.sales.getAll({
          startDate: filters.dateRange.start.toISOString().split('T')[0],
          endDate: filters.dateRange.end.toISOString().split('T')[0]
        }),
        apiService.targets.getActive(),
        apiService.settings.getDashboardSettings(),
        apiService.users.getSalesRepData()
      ]);
      
      // Set state with fetched data
      setSalesData(salesResponse.data || []);
      setFilteredSalesData(salesResponse.data || []);
      setTargets(targetsResponse.data || {});
      setSettings(settingsResponse.data || null);
      setSalesReps(salesRepsResponse.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading application data:', err);
      setError(err.message || 'Failed to load application data');
      showError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters.dateRange.start, filters.dateRange.end, showError]);
  
  // Load data on initial render
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Apply filters to data whenever filters change
  useEffect(() => {
    if (!salesData || salesData.length === 0) {
      setFilteredSalesData([]);
      return;
    }
    
    // If date range filters change, reload from API
    const startDate = filters.dateRange.start.toISOString().split('T')[0];
    const endDate = filters.dateRange.end.toISOString().split('T')[0];
    
    const fetchFilteredData = async () => {
      try {
        setLoading(true);
        
        // Create API filter parameters
        const apiFilters = {
          startDate,
          endDate
        };
        
        // Add other filters if not set to 'all'
        if (filters.category !== 'all') apiFilters.category = filters.category;
        if (filters.salesUnit !== 'all') apiFilters.salesUnit = filters.salesUnit;
        if (filters.customer !== 'all') apiFilters.customer = filters.customer;
        if (filters.product !== 'all') apiFilters.material = filters.product;
        if (filters.salesRep !== 'all') apiFilters.salesRepId = filters.salesRep;
        
        // Fetch filtered data from API
        const response = await apiService.sales.getAll(apiFilters);
        
        // Update state
        setSalesData(response.data || []);
        setFilteredSalesData(response.data || []);
      } catch (err) {
        console.error('Error filtering sales data:', err);
        showError('Failed to filter data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilteredData();
  }, [filters, showError]);

  // Function to refresh data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Refresh sales data with current filters
      const startDate = filters.dateRange.start.toISOString().split('T')[0];
      const endDate = filters.dateRange.end.toISOString().split('T')[0];
      
      // Create API filter parameters
      const apiFilters = {
        startDate,
        endDate
      };
      
      // Add other filters if not set to 'all'
      if (filters.category !== 'all') apiFilters.category = filters.category;
      if (filters.salesUnit !== 'all') apiFilters.salesUnit = filters.salesUnit;
      if (filters.customer !== 'all') apiFilters.customer = filters.customer;
      if (filters.product !== 'all') apiFilters.material = filters.product;
      if (filters.salesRep !== 'all') apiFilters.salesRepId = filters.salesRep;
      
      // Fetch all required data in parallel
      const [salesResponse, targetsResponse, salesRepsResponse] = await Promise.all([
        apiService.sales.getAll(apiFilters),
        apiService.targets.getActive(),
        apiService.users.getSalesRepData()
      ]);
      
      // Update state
      setSalesData(salesResponse.data || []);
      setFilteredSalesData(salesResponse.data || []);
      setTargets(targetsResponse.data || {});
      setSalesReps(salesRepsResponse.data || []);
      setLastUpdated(new Date());
      
      showSuccess('Dashboard data refreshed successfully');
      return { success: true };
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to refresh data');
      showError('Failed to refresh data. Please try again later.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [filters, showError, showSuccess]);

  // Function to update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Function to reset filters to default
  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      salesUnit: 'all',
      customer: 'all',
      product: 'all',
      salesRep: 'all',
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
      }
    });
  }, []);

  // Function to update targets
  const updateTargets = useCallback(async (newTargets) => {
    try {
      setLoading(true);
      
      // Update targets on server
      await apiService.targets.bulkUpdate(newTargets);
      
      // Refresh targets from server to get latest data
      const response = await apiService.targets.getActive();
      setTargets(response.data || {});
      
      showSuccess('Targets updated successfully');
      return { success: true };
    } catch (err) {
      console.error('Error updating targets:', err);
      showError(err.message || 'Failed to update targets');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  // Function to update user settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      
      // Update dashboard settings on server
      await apiService.settings.updateDashboardSettings(newSettings);
      
      // Update local state
      setSettings(newSettings);
      
      showSuccess('Settings updated successfully');
      return { success: true };
    } catch (err) {
      console.error('Error updating settings:', err);
      showError(err.message || 'Failed to update settings');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  // Calculate summary metrics based on filtered data
  const summaryMetrics = useMemo(() => {
    if (!filteredSalesData || filteredSalesData.length === 0) return {
      totalSales: 0,
      formattedTotalSales: formatCurrency(0),
      itemCount: 0,
      averageSale: 0,
      formattedAverageSale: formatCurrency(0),
      growth: 0
    };
    
    // Calculate summary metrics
    const totalSales = filteredSalesData.reduce((sum, item) => sum + (parseFloat(item.item_net) || 0), 0);
    const itemCount = filteredSalesData.length;
    const averageSale = totalSales / itemCount;
    
    // In real implementation, we would calculate growth from historical data
    // Here we'll fetch it from the API
    const growth = 0; // This would come from a summary API call
    
    return {
      totalSales,
      formattedTotalSales: formatCurrency(totalSales),
      itemCount,
      averageSale,
      formattedAverageSale: formatCurrency(averageSale),
      growth
    };
  }, [filteredSalesData]);

  // Calculate target achievement
  const targetAchievement = useMemo(() => {
    if (!filteredSalesData || filteredSalesData.length === 0 || !targets || !targets.monthly) return {
      percentage: 0,
      value: 0,
      formattedValue: formatCurrency(0),
      target: 0,
      formattedTarget: formatCurrency(0)
    };
    
    const totalSales = filteredSalesData.reduce((sum, item) => sum + (parseFloat(item.item_net) || 0), 0);
    const targetValue = targets.monthly || 0;
    const percentage = targetValue > 0 ? (totalSales / targetValue) * 100 : 0;
    
    return {
      percentage,
      value: totalSales,
      formattedValue: formatCurrency(totalSales),
      target: targetValue,
      formattedTarget: formatCurrency(targetValue)
    };
  }, [filteredSalesData, targets]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    if (!salesData || salesData.length === 0) return {
      categories: [],
      salesUnits: [],
      customers: [],
      products: []
    };
    
    const categories = getUniqueValues(salesData, 'category');
    const salesUnits = getUniqueValues(salesData, 'sales_unit_name');
    const customers = getUniqueValues(salesData, 'customer_name');
    const products = getUniqueValues(salesData, 'material_name');
    
    return {
      categories,
      salesUnits,
      customers,
      products
    };
  }, [salesData]);

  // Create the value object
  const value = {
    // Data states
    salesData,
    filteredSalesData,
    targets,
    settings,
    salesReps,
    filters,
    loading,
    error,
    lastUpdated,
    
    // Computed metrics
    summaryMetrics,
    targetAchievement,
    filterOptions,
    
    // Actions
    refreshData,
    updateFilters,
    resetFilters,
    updateTargets,
    updateSettings,
    loadInitialData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;