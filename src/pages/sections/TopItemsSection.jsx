// src/pages/sections/TopItemsSection.jsx - Updated with visibility options

import React, { useState, useEffect } from 'react';
import TopProductsCard from '../../components/dashboard/TopProductsCard';
import TopCustomersCard from '../../components/dashboard/TopCustomersCard';
import { useData } from '../../context/DataContext';
import { groupSalesByDimension, getTopItems } from '../../utils/dataProcessing';

const TopItemsSection = ({ showProducts = true, showCustomers = true }) => {
  const { filteredSalesData, loading } = useData();
  const [topProductsData, setTopProductsData] = useState([]);
  const [topCustomersData, setTopCustomersData] = useState([]);

  useEffect(() => {
    if (filteredSalesData && filteredSalesData.length > 0) {
      // Process data for Top Products if visible
      if (showProducts) {
        const productSalesData = groupSalesByDimension(filteredSalesData, 'Material Name', 'Item Net');
        setTopProductsData(getTopItems(productSalesData, 5));
      }
      
      // Process data for Top Customers if visible
      if (showCustomers) {
        const customerSalesData = groupSalesByDimension(filteredSalesData, 'Customer Name', 'Item Net');
        setTopCustomersData(getTopItems(customerSalesData, 5));
      }
    } else {
      setTopProductsData([]);
      setTopCustomersData([]);
    }
  }, [filteredSalesData, showProducts, showCustomers]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // If no data available
  const noDataComponent = (title) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500">No data available for the selected filters.</p>
      </div>
    </div>
  );

  // Determine the grid layout based on what's visible
  const gridCols = showProducts && showCustomers ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid ${gridCols} gap-6 mb-6`}>
      {showProducts && (
        topProductsData.length > 0 ? (
          <TopProductsCard data={topProductsData} />
        ) : (
          noDataComponent("Top Products")
        )
      )}
      
      {showCustomers && (
        topCustomersData.length > 0 ? (
          <TopCustomersCard data={topCustomersData} />
        ) : (
          noDataComponent("Top Customers")
        )
      )}
    </div>
  );
};

export default TopItemsSection;