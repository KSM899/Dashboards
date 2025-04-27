
// src/utils/dataProcessing.js

/**
 * Process sales data for dashboard visualization
 */

// Format currency values
export const formatCurrency = (value, currency = 'OMR', maximumFractionDigits = 0) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: maximumFractionDigits 
    }).format(value);
  };
  
  // Format percentage values
  export const formatPercentage = (value, decimalPlaces = 1) => {
    return `${value.toFixed(decimalPlaces)}%`;
  };
  
  // Calculate total sales from raw data
  export const calculateTotalSales = (data, dateRange = null) => {
    let filteredData = data;
    
    if (dateRange) {
      const { startDate, endDate } = dateRange;
      filteredData = data.filter(item => {
        const itemDate = new Date(item.Date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    return filteredData.reduce((sum, item) => sum + parseFloat(item["Item Net"] || 0), 0);
  };
  
  // Calculate growth percentage between two periods
  export const calculateGrowth = (currentValue, previousValue) => {
    if (previousValue === 0) return 100; // Handle division by zero
    return ((currentValue - previousValue) / previousValue) * 100;
  };
  
  // Calculate target achievement percentage
  export const calculateTargetAchievement = (actualValue, targetValue) => {
    if (targetValue === 0) return 100; // Handle division by zero
    return (actualValue / targetValue) * 100;
  };
  
  // Group sales by dimension (category, region, rep, etc.)
  export const groupSalesByDimension = (data, dimension, valueProp = "Item Net") => {
    const grouped = {};
    
    data.forEach(item => {
      const key = item[dimension] || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key] += parseFloat(item[valueProp] || 0);
    });
    
    // Convert to array format for charts
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Get top N items by value
  export const getTopItems = (data, count = 5) => {
    return [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
  };
  
  // Process data for time series chart
  export const processTimeSeriesData = (data, dateField = "Date", valueField = "Item Net", timeInterval = "day") => {
    const aggregated = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      
      let timeKey;
      switch (timeInterval) {
        case 'month':
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          // Get the week number
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
          timeKey = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
          break;
        case 'day':
        default:
          timeKey = date.toISOString().split('T')[0];
      }
      
      if (!aggregated[timeKey]) {
        aggregated[timeKey] = 0;
      }
      
      aggregated[timeKey] += parseFloat(item[valueField] || 0);
    });
    
    // Convert to array and sort by date
    return Object.entries(aggregated)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Filter data based on multiple criteria
  export const filterData = (data, filters) => {
    return data.filter(item => {
      let passes = true;
      
      // Apply date range filter
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        const itemDate = new Date(item.Date);
        if (itemDate < startDate || itemDate > endDate) {
          passes = false;
        }
      }
      
      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        if (item.Category !== filters.category) {
          passes = false;
        }
      }
      
      // Apply sales unit filter
      if (filters.salesUnit && filters.salesUnit !== 'all') {
        if (item["Sales Unit"] !== filters.salesUnit && item["Sales Unit Name"] !== filters.salesUnit) {
          passes = false;
        }
      }
      
      // Apply customer filter
      if (filters.customer && filters.customer !== 'all') {
        if (item["Customer-ID"] !== filters.customer) {
          passes = false;
        }
      }
      
      // Apply product filter
      if (filters.product && filters.product !== 'all') {
        if (item["Material-ID"] !== filters.product && item["Material Name"] !== filters.product) {
          passes = false;
        }
      }
      
      return passes;
    });
  };
  
  // Get all unique values for a given field (for filter options)
  export const getUniqueValues = (data, field) => {
    const uniqueValues = new Set();
    
    data.forEach(item => {
      if (item[field]) {
        uniqueValues.add(item[field]);
      }
    });
    
    return Array.from(uniqueValues);
  };
  
  // Calculate sales funnel data
  export const calculateSalesFunnel = (data, stages) => {
    const funnel = stages.map(stage => ({
      name: stage.name,
      value: data.filter(item => item.Stage === stage.id).length
    }));
    
    return funnel;
  };