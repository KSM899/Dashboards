// src/components/dashboard/SalesByRegionCard.jsx
import React, { useState } from 'react';
import { Map, BarChart as BarChartIcon } from 'lucide-react';
import BarChart from '../charts/BarChart';
import { formatCurrency } from '../../utils/dataProcessing';

// We'll create a simplified map visualization since a full map would require additional libraries
const SimpleMapView = ({ data, totalValue }) => {
  // For a real implementation, you would use a proper mapping library like react-simple-maps
  // This is a simplified representation for demo purposes
  return (
    <div className="h-64 flex flex-col items-center justify-center">
      <div className="grid grid-cols-2 gap-4 w-full">
        {data.map((region, index) => (
          <div 
            key={index}
            className="border rounded-lg p-4 flex flex-col items-center relative overflow-hidden"
            style={{ 
              backgroundColor: `rgba(0, 136, 254, ${Math.min(0.1 + (region.value / totalValue) * 0.9, 0.9)})`,
            }}
          >
            <div className="font-medium text-gray-800 mb-1">{region.name}</div>
            <div className="text-sm text-gray-600">{formatCurrency(region.value)}</div>
            <div className="text-xs text-gray-500">
              {((region.value / totalValue) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SalesByRegionCard = ({ data, title = "Sales by Region", className = "" }) => {
  const [viewType, setViewType] = useState('map'); // 'map' or 'chart'
  
  // Sum total value for percentage calculation
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Format for data table
  const tableData = data.map(region => ({
    ...region,
    percentage: ((region.value / totalValue) * 100).toFixed(1) + '%'
  }));
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('map')}
            className={`p-2 rounded ${viewType === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Show as map view"
          >
            <Map size={16} />
          </button>
          <button
            onClick={() => setViewType('chart')}
            className={`p-2 rounded ${viewType === 'chart' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Show as bar chart"
          >
            <BarChartIcon size={16} />
          </button>
        </div>
      </div>
      
      <div className="h-64">
        {viewType === 'map' ? (
          <SimpleMapView data={data} totalValue={totalValue} />
        ) : (
          <BarChart 
            data={data} 
            height={250}
            tooltipFormatter={(value) => formatCurrency(value)}
          />
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">All Regions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((region, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-900">{region.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">{formatCurrency(region.value)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">{region.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesByRegionCard;