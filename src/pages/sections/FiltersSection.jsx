// src/pages/sections/FiltersSection.jsx

import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import AdvancedFilters from '../../components/common/AdvancedFilters';
import { useData } from '../../context/DataContext';

const FiltersSection = () => {
  const [expanded, setExpanded] = useState(false);
  const { 
    salesData, 
    filters, 
    updateFilters, 
    resetFilters,
    filterOptions
  } = useData();

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Filter size={18} className="text-gray-500 mr-2" />
          <h2 className="text-base font-medium text-gray-700">Filters</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset
          </button>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Less filters
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                More filters
              </>
            )}
          </button>
        </div>
      </div>
      
      <AdvancedFilters 
        filters={filters}
        salesData={salesData}
        onFilterChange={handleFilterChange}
        expanded={expanded}
      />
    </div>
  );
};

export default FiltersSection;