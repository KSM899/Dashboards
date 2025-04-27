// src/components/dashboard/SalesByRepCard.jsx
import React, { useState } from 'react';
import { Users, BarChartIcon, Award } from 'lucide-react';
import BarChart from '../charts/BarChart';
import { formatCurrency } from '../../utils/dataProcessing';

const SalesByRepCard = ({ data = [], targets = {}, title = "Sales by Rep", className = "" }) => {
  const [sortBy, setSortBy] = useState('value'); // 'value', 'target', 'name'
  
  // Calculate achievement percentages if targets are provided
  const dataWithAchievement = data.map(rep => {
    const target = targets[rep.id] || 0;
    const achievement = target > 0 ? (rep.value / target) * 100 : 0;
    
    return {
      ...rep,
      target,
      achievement,
      achievementFormatted: `${achievement.toFixed(1)}%`
    };
  });
  
  // Sort data based on selected criterion
  const sortedData = [...dataWithAchievement].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'target':
        return b.target - a.target;
      case 'achievement':
        return b.achievement - a.achievement;
      case 'value':
      default:
        return b.value - a.value;
    }
  });
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        </div>
        
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-green-50">
            <Users size={18} className="text-green-500" />
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <BarChart 
          data={sortedData} 
          height={250}
          tooltipFormatter={(value) => formatCurrency(value)}
          barColor="#4CAF50"
        />
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">Sales Representatives</h3>
          
          <div className="flex space-x-2 text-xs">
            <button 
              onClick={() => setSortBy('value')}
              className={`px-2 py-1 rounded ${sortBy === 'value' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              By Sales
            </button>
            {Object.keys(targets).length > 0 && (
              <button 
                onClick={() => setSortBy('achievement')}
                className={`px-2 py-1 rounded ${sortBy === 'achievement' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                By Achievement
              </button>
            )}
            <button 
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded ${sortBy === 'name' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              By Name
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rep Name</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                {Object.keys(targets).length > 0 && (
                  <>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Achievement</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.map((rep, index) => (
                <tr key={rep.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-900 flex items-center">
                    {index < 3 && (
                      <Award 
                        size={16} 
                        className={`mr-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} 
                      />
                    )}
                    {rep.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">
                    {formatCurrency(rep.value)}
                  </td>
                  {Object.keys(targets).length > 0 && (
                    <>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right">
                        {formatCurrency(rep.target)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        <span 
                          className={
                            rep.achievement >= 100 ? 'text-green-500' : 
                            rep.achievement >= 75 ? 'text-blue-500' : 
                            'text-yellow-500'
                          }
                        >
                          {rep.achievementFormatted}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesByRepCard;