// src/pages/sections/SalesByCategorySection.jsx

import React, { useState, useEffect } from 'react';
import SalesByCategoryCard from '../../components/dashboard/SalesByCategoryCard';
import { useData } from '../../context/DataContext';
import { groupSalesByDimension } from '../../utils/dataProcessing';

const SalesByCategorySection = () => {
  const { filteredSalesData, loading } = useData();
  const [categorySalesData, setCategorySalesData] = useState([]);

  useEffect(() => {
    if (filteredSalesData && filteredSalesData.length > 0) {
      const groupedData = groupSalesByDimension(filteredSalesData, 'Category', 'Item Net');
      setCategorySalesData(groupedData);
    } else {
      setCategorySalesData([]);
    }
  }, [filteredSalesData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex justify-center items-center h-64">
          <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (categorySalesData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Sales by Category</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500">No data available for the selected filters.</p>
        </div>
      </div>
    );
  }

  return <SalesByCategoryCard data={categorySalesData} />;
};

export default SalesByCategorySection;