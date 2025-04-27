// src/pages/sections/ForecastSection.jsx

import React from 'react';
import SalesForecastCard from '../../components/dashboard/SalesForecastCard';
import { useData } from '../../context/DataContext';

const ForecastSection = () => {
  const { loading } = useData();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return <SalesForecastCard />;
};

export default ForecastSection;