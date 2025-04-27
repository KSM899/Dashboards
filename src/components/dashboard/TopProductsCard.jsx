import React from 'react';
import { Package } from 'lucide-react';
import BarChart from '../charts/BarChart';
import { formatCurrency } from '../../utils/dataProcessing';

const TopProductsCard = ({ data, title = "Top Products", maxItems = 5, className = "" }) => {
  // Ensure we display only the requested number of items
  const displayData = data.slice(0, maxItems);
  
  // Calculate total value for percentage calculation
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Format for data table
  const tableData = displayData.map(product => ({
    ...product,
    percentage: ((product.value / totalValue) * 100).toFixed(1) + '%'
  }));
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <div className="p-2 rounded-full bg-blue-50">
          <Package size={18} className="text-blue-500" />
        </div>
      </div>
      
      <div className="h-64">
        <BarChart 
          data={displayData} 
          height={250}
          tooltipFormatter={(value) => formatCurrency(value)}
          legendName="Sales Value"
        />
      </div>
      
      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((product, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-900">{product.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">{formatCurrency(product.value)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">{product.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopProductsCard;