// src/components/dashboard/SalesByCategoryCard.jsx
import React, { useState } from 'react';
import { PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import { formatCurrency, getTopItems } from '../../utils/dataProcessing';

const SalesByCategoryCard = ({ data, title = "Sales by Category", className = "" }) => {
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'
  
  // Get top categories by sales
  const topCategories = getTopItems(data, 5);
  
  // For pie chart, if there are more than 5 categories, add an "Other" category
  const pieData = data.length > 5 
    ? [
        ...topCategories,
        {
          name: 'Other',
          value: data.slice(5).reduce((sum, item) => sum + item.value, 0)
        }
      ]
    : data;
  
  // Sum total value for percentage calculation  
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Format for bar chart data table
  const tableData = topCategories.map(item => ({
    ...item,
    percentage: ((item.value / totalValue) * 100).toFixed(1) + '%'
  }));
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('pie')}
            className={`p-2 rounded ${chartType === 'pie' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Show as pie chart"
          >
            <PieChartIcon size={16} />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Show as bar chart"
          >
            <BarChartIcon size={16} />
          </button>
        </div>
      </div>
      
      <div className="h-64">
        {chartType === 'pie' ? (
          <PieChart 
            data={pieData} 
            height={250}
            innerRadius={60}
            tooltipFormatter={(value) => formatCurrency(value)}
          />
        ) : (
          <BarChart 
            data={topCategories} 
            height={250}
            tooltipFormatter={(value) => formatCurrency(value)}
          />
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Top Categories</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((category, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-900">{category.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">{formatCurrency(category.value)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">{category.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesByCategoryCard;