// src/pages/sections/SalesRepTargetSection.jsx

import React, { useState, useEffect } from 'react';
import SalesByRepCard from '../../components/dashboard/SalesByRepCard';
import TargetEditor from '../../components/common/TargetEditor';
import { useData } from '../../context/DataContext';
import { groupSalesByDimension } from '../../utils/dataProcessing';

const SalesRepTargetSection = () => {
  const { 
    filteredSalesData, 
    salesReps, 
    targets, 
    updateTargets, 
    filterOptions,
    loading 
  } = useData();
  
  const [repSalesData, setRepSalesData] = useState([]);

  useEffect(() => {
    if (filteredSalesData && filteredSalesData.length > 0 && salesReps && salesReps.length > 0) {
      // In a real app, you'd have sales data linked to reps directly
      // For this implementation, we'll approximate based on region
      
      // First group sales by region
      const regionSalesData = groupSalesByDimension(filteredSalesData, 'Sales Unit Name', 'Item Net');
      
      // Then assign sales to reps based on their region
      const salesByRep = salesReps.map(rep => {
        const regionSale = regionSalesData.find(r => r.name === rep.region);
        const regionValue = regionSale ? regionSale.value : 0;
        
        // Distribute region sales among reps in that region
        // In a real app, this would use actual rep-specific data
        const repCount = salesReps.filter(r => r.region === rep.region).length;
        const distributionFactor = repCount > 0 ? (0.7 + (0.6 * Math.random())) / repCount : 0;
        
        return {
          id: rep.id,
          name: rep.name,
          region: rep.region,
          value: regionValue * distributionFactor
        };
      });
      
      setRepSalesData(salesByRep);
    } else {
      setRepSalesData([]);
    }
  }, [filteredSalesData, salesReps]);

  const handleSaveTargets = async (updatedTargets) => {
    try {
      await updateTargets(updatedTargets);
      // Success notification would be shown here
    } catch (error) {
      console.error('Error saving targets:', error);
      // Error notification would be shown here
    }
  };

  // Extract rep targets from the main targets object
  const getRepTargets = () => {
    if (!targets) return {};
    
    return Object.entries(targets)
      .filter(([key]) => key.startsWith('rep_'))
      .reduce((obj, [key, value]) => {
        obj[key.replace('rep_', '')] = value;
        return obj;
      }, {});
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {repSalesData.length > 0 ? (
        <SalesByRepCard 
          data={repSalesData} 
          targets={getRepTargets()}
          title="Sales by Representative"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Sales by Representative</h2>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-500">No sales rep data available for the selected filters.</p>
          </div>
        </div>
      )}
      
      <TargetEditor 
        targets={targets || {}}
        onSaveTargets={handleSaveTargets}
        categories={filterOptions?.categories || []}
        salesUnits={filterOptions?.salesUnits || []}
        salesReps={salesReps || []}
      />
    </div>
  );
};

export default SalesRepTargetSection;