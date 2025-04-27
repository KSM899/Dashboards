// src/pages/sections/KpiCardsSection.jsx

import React from 'react';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import KpiCard from '../../components/dashboard/KpiCard';
import { formatCurrency } from '../../utils/dataProcessing';
import { useData } from '../../context/DataContext';

const KpiCardsSection = () => {
  const { 
    summaryMetrics, 
    targetAchievement,
    loading 
  } = useData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Use default values if the data isn't available yet
  const totalSales = summaryMetrics?.totalSales || 0;
  const formattedTotalSales = summaryMetrics?.formattedTotalSales || formatCurrency(0);
  const averageSale = summaryMetrics?.averageSale || 0;
  const formattedAverageSale = summaryMetrics?.formattedAverageSale || formatCurrency(0);
  const itemCount = summaryMetrics?.itemCount || 0;
  const growth = summaryMetrics?.growth || 0;

  // Target achievement values
  const targetPercentage = targetAchievement?.percentage || 0;
  const formattedTarget = targetAchievement?.formattedTarget || formatCurrency(0);
  const formattedValue = targetAchievement?.formattedValue || formatCurrency(0);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total Sales (MTD)"
          value={formattedTotalSales}
          icon={<DollarSign />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          changeValue={growth}
          changePeriod="vs previous month"
        />
        
        <KpiCard
          title="Target vs Actual"
          value={`${targetPercentage.toFixed(1)}%`}
          icon={<Award />}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
          footer={
            <div className="w-full mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    targetPercentage >= 100 
                      ? 'bg-green-500' 
                      : targetPercentage >= 75 
                        ? 'bg-blue-500' 
                        : 'bg-yellow-500'
                  }`} 
                  style={{ width: `${Math.min(targetPercentage, 100)}%` }}>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Target: {formattedTarget}</span>
                <span>Actual: {formattedValue}</span>
              </div>
            </div>
          }
        />
        
        <KpiCard
          title="Average Sale"
          value={formattedAverageSale}
          icon={<TrendingUp />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          changeValue={8.3} // This would come from real data in production
          changePeriod="vs previous month"
          footer={
            <div className="text-sm text-gray-500 mt-1">
              Total Orders: {itemCount}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default KpiCardsSection;