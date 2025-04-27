import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Settings } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useData } from '../context/DataContext';
import ExportDashboard from '../components/common/ExportDashboard';
import DateRangePicker from '../components/common/DateRangePicker';
import DashboardSettings from '../components/common/DashboardSettings';
import ImportButton from '../components/common/ImportButton';
import { useNotification } from '../context/NotificationContext'; // ✅ Notification hook

// Section components
import KpiCardsSection from './sections/KpiCardsSection';
import FiltersSection from './sections/FiltersSection';
import SalesByCategorySection from './sections/SalesByCategorySection';
import SalesByRegionSection from './sections/SalesByRegionSection';
import SalesTrendsSection from './sections/SalesTrendsSection';
import TopItemsSection from './sections/TopItemsSection';
import SalesRepTargetSection from './sections/SalesRepTargetSection';
import ForecastSection from './sections/ForecastSection';

// Dashboard cards
import SalesByRepCard from '../components/dashboard/SalesByRepCard';
import TargetEditor from '../components/common/TargetEditor';

const Dashboard = () => {
  const { refreshData, loading, lastUpdated, settings } = useData();
  const { success, error } = useNotification(); // ✅ Added notification handlers
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const dashboardSettings = settings?.dashboardSettings || {
    layout: 'default',
    visibleSections: {
      kpiCards: true,
      salesByCategory: true,
      salesByRegion: true,
      salesTrends: true,
      topProducts: true,
      topCustomers: true,
      salesByRep: true,
      targetEditor: true,
      salesForecast: true
    },
    compactView: false
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      success('Dashboard data refreshed successfully', {
        title: 'Data Refreshed',
        duration: 3000
      });
    } catch (err) {
      console.error('Error refreshing data:', err);
      error('Failed to refresh dashboard data. Please try again.', {
        title: 'Refresh Failed',
        duration: 5000
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const { visibleSections } = dashboardSettings;

  return (
    <DashboardLayout>
      <div id="dashboard-container" className="mb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>

            {/* ✅ Import Button with Notifications */}
            <ImportButton
              onSuccess={(results) => {
                success(
                  `Successfully imported ${results.importedCount} records${results.errorCount > 0 ? ` with ${results.errorCount} errors` : ''}`,
                  {
                    title: 'Data Import Complete',
                    duration: 5000
                  }
                );
                handleRefresh();
              }}
              onError={(errorMessage) => {
                error(
                  errorMessage || 'An error occurred during import. Please try again.',
                  {
                    title: 'Import Failed',
                    duration: 10000
                  }
                );
              }}
            />

            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>

              {showExport && (
                <ExportDashboard onClose={() => setShowExport(false)} />
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
            >
              <Settings size={16} className="mr-2" />
              Settings
            </button>

            {showSettings && (
              <DashboardSettings onClose={() => setShowSettings(false)} />
            )}
          </div>
        </div>

        {/* Content */}
        {loading && !isRefreshing ? (
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded mb-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-80">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <FiltersSection />
            {visibleSections.kpiCards && <KpiCardsSection />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {visibleSections.salesByCategory && <SalesByCategorySection />}
              {visibleSections.salesByRegion && <SalesByRegionSection />}
            </div>

            {visibleSections.salesTrends && (
              <div className="mb-6">
                <SalesTrendsSection />
              </div>
            )}

            {visibleSections.salesForecast && (
              <div className="mb-6">
                <ForecastSection />
              </div>
            )}

            {(visibleSections.topProducts || visibleSections.topCustomers) && (
              <TopItemsSection
                showProducts={visibleSections.topProducts}
                showCustomers={visibleSections.topCustomers}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {visibleSections.salesByRep && <SalesByRepCard />}
              {visibleSections.targetEditor && <TargetEditor />}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
