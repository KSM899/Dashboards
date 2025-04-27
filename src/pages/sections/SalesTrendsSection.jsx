// src/pages/sections/SalesTrendsSection.jsx

import React, { useState, useEffect } from 'react';
import SalesTrendsCard from '../../components/dashboard/SalesTrendsCard';
import { useData } from '../../context/DataContext';

const SalesTrendsSection = () => {
  const { filteredSalesData, loading } = useData();
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  useEffect(() => {
    if (filteredSalesData && filteredSalesData.length > 0) {
      // Convert sales data to time series format
      const trendsData = filteredSalesData.map(item => ({
        date: item.Date,
        value: item["Item Net"]
      }));
      
      // Sort by date
      trendsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setTimeSeriesData(trendsData);
    } else {
      setTimeSeriesData([]);
    }
  }, [filteredSalesData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (timeSeriesData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Sales Trends</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500">No trend data available for the selected date range.</p>
        </div>
      </div>
    );
  }

  return <SalesTrendsCard data={timeSeriesData} />;
};

export default SalesTrendsSection;