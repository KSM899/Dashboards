// src/components/dashboard/SalesTrendsCard.jsx
import React, { useState } from 'react';
import { TrendingUp, LineChart as LineChartIcon, BarChartIcon, Calendar } from 'lucide-react';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import AreaChart from '../charts/AreaChart';
import { formatCurrency } from '../../utils/dataProcessing';

const SalesTrendsCard = ({ data, title = "Sales Trends", className = "" }) => {
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', or 'area'
  const [timeGrouping, setTimeGrouping] = useState('day'); // 'day', 'week', 'month'
  
  // Group data by time interval
  const groupDataByTime = (data, timeInterval) => {
    const grouped = {};
    
    data.forEach(item => {
      let key;
      const date = new Date(item.date);
      
      switch(timeInterval) {
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          // Get week start date
          const startDate = new Date(date);
          startDate.setDate(date.getDate() - date.getDay());
          key = startDate.toISOString().split('T')[0];
          break;
        case 'day':
        default:
          key = item.date;
      }
      
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      
      grouped[key] += item.value;
    });
    
    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  const groupedData = groupDataByTime(data, timeGrouping);
  
  // Format dates for display
  const formatDate = (dateStr, interval) => {
    const date = new Date(dateStr);
    
    switch(interval) {
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'week':
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + 6);
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'day':
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  const formattedData = groupedData.map(item => ({
    ...item,
    formattedDate: formatDate(item.date, timeGrouping)
  }));
  
  // Calculate growth rate from first to last period
  const calculateGrowthRate = (data) => {
    if (data.length < 2) return 0;
    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    return firstValue ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  };
  
  const growthRate = calculateGrowthRate(formattedData);
  
  // Prepare table data with period-over-period changes
  const getTrendTableData = (data) => {
    return data.map((item, index) => {
      const prevValue = index > 0 ? data[index - 1].value : item.value;
      const change = prevValue ? ((item.value - prevValue) / prevValue) * 100 : 0;
      
      return {
        ...item,
        change: change.toFixed(1) + '%',
        formattedValue: formatCurrency(item.value),
        changeClass: change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'
      };
    }).slice(-5); // Show only last 5 periods
  };
  
  const trendTableData = getTrendTableData(formattedData);
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <div className="flex items-center ml-4">
            <TrendingUp 
              size={16} 
              className={growthRate >= 0 ? "text-green-500" : "text-red-500"} 
            />
            <span className={`text-sm font-medium ml-1 ${growthRate >= 0 ? "text-green-500" : "text-red-500"}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Grouping Selector */}
          <div className="flex space-x-2 border rounded-md p-1 bg-gray-50">
            <button
              onClick={() => setTimeGrouping('day')}
              className={`px-2 py-1 text-xs rounded ${timeGrouping === 'day' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              Day
            </button>
            <button
              onClick={() => setTimeGrouping('week')}
              className={`px-2 py-1 text-xs rounded ${timeGrouping === 'week' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeGrouping('month')}
              className={`px-2 py-1 text-xs rounded ${timeGrouping === 'month' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              Month
            </button>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Line chart"
            >
              <LineChartIcon size={16} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Bar chart"
            >
              <BarChartIcon size={16} />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-2 rounded ${chartType === 'area' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Area chart"
            >
              <Calendar size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        {chartType === 'line' && (
          <LineChart 
            data={formattedData} 
            height={250}
            dataKey="value"
            xAxisDataKey="formattedDate"
            tooltipFormatter={(value) => formatCurrency(value)}
          />
        )}
        {chartType === 'bar' && (
          <BarChart 
            data={formattedData} 
            height={250}
            dataKey="value"
            xAxisDataKey="formattedDate"
            tooltipFormatter={(value) => formatCurrency(value)}
          />
        )}
        {chartType === 'area' && (
          <AreaChart 
            data={formattedData} 
            height={250}
            dataKey="value"
            xAxisDataKey="formattedDate"
            tooltipFormatter={(value) => formatCurrency(value)}
          />
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Trend</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trendTableData.map((period, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-900">{period.formattedDate}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">{period.formattedValue}</td>
                  <td className={`px-3 py-2 text-sm ${period.changeClass} text-right`}>
                    {period.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTrendsCard;