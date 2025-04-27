// src/pages/sections/SalesByRegionSection.jsx

import React, { useState, useEffect } from 'react';
import SalesByRegionCard from '../../components/dashboard/SalesByRegionCard';
import { useData } from '../../context/DataContext';
import { groupSalesByDimension } from '../../utils/dataProcessing';

const SalesByRegionSection = () => {
  const { filteredSalesData, loading } = useData();
  const [regionSalesData, setRegionSalesData] = useState([]);

  useEffect(() => {
    if (filteredSalesData && filteredSalesData.length > 0) {
      const groupedData = groupSalesByDimension(filteredSalesData, 'Sales Unit Name', 'Item Net');
      setRegionSalesData(groupedData);
    } else {
      setRegionSalesData([]);
    }
  }, [filteredSalesData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (regionSalesData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Sales by Region</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500">No region data available for the selected filters.</p>
        </div>
      </div>
    );
  }

  return <SalesByRegionCard data={regionSalesData} />;
};

export default SalesByRegionSection;