// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Database, BellRing, Shield, Globe, Monitor, Check } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { hasPermission } from '../services/authService';

// In a real application, these would be API calls
const fetchSettings = () => {
  // This simulates the API call
  return Promise.resolve({
    general: {
      companyName: 'Acme Corporation',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'America/New_York',
      currency: 'USD',
      fiscalYearStart: '01/01'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#0066CC',
      accentColor: '#4CAF50',
      showLogo: true,
      compactMode: false,
      dashboardLayout: 'default'
    },
    notifications: {
      emailNotifications: true,
      salesAlerts: true,
      targetAlerts: true,
      systemNotifications: true,
      notificationDigest: 'daily'
    },
    dataSettings: {
      dataRetentionPeriod: 36,
      autoRefreshDashboard: true,
      refreshInterval: 5,
      defaultDateRange: 'thisMonth',
      cacheData: true
    },
    security: {
      sessionTimeout: 30,
      mfaEnabled: false,
      passwordPolicy: 'medium',
      autoLogout: true,
      ipRestriction: false
    }
  });
};

const saveSettings = (settings) => {
  // This simulates the API call to save settings
  console.log('Saving settings:', settings);
  return Promise.resolve({ success: true });
};

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if user has permissions
  const canEditSettings = hasPermission('EDIT_SETTINGS');

  // Fetch settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settingsData = await fetchSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading settings:', error);
        // In a real app, show error notification
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleInputChange = (category, setting, value) => {
    if (!canEditSettings) return;
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    if (!canEditSettings) return;
    
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      // In a real app, this would be an API call to save settings
      const result = await saveSettings(settings);
      
      if (result.success) {
        setSaveSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // In a real app, show error notification
    } finally {
      setIsSaving(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          id="companyName"
          value={settings.general.companyName}
          onChange={(e) => handleInputChange('general', 'companyName', e.target.value)}
          disabled={!canEditSettings}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">Date Format</label>
          <select
            id="dateFormat"
            value={settings.general.dateFormat}
            onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
            disabled={!canEditSettings}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">Time Format</label>
          <select
            id="timeFormat"
            value={settings.general.timeFormat}
            onChange={(e) => handleInputChange('general', 'timeFormat', e.target.value)}
            disabled={!canEditSettings}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="12h">12 Hour (AM/PM)</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
          <select
            id="timezone"
            value={settings.general.timezone}
            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
            disabled={!canEditSettings}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
            <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            id="currency"
            value={settings.general.currency}
            onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
            disabled={!canEditSettings}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="JPY">Japanese Yen (JPY)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="AUD">Australian Dollar (AUD)</option>
            <option value="OMR">Omani Rial (OMR)</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="fiscalYearStart" className="block text-sm font-medium text-gray-700">Fiscal Year Start</label>
        <input
          type="text"
          id="fiscalYearStart"
          value={settings.general.fiscalYearStart}
          onChange={(e) => handleInputChange('general', 'fiscalYearStart', e.target.value)}
          disabled={!canEditSettings}
          placeholder="MM/DD"
          className="mt-1 block w-full sm:w-1/4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        />
        <p className="mt-1 text-sm text-gray-500">Format: MM/DD (e.g., 01/01 for January 1st)</p>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
          <select
            id="theme"
            value={settings.appearance.theme}
            onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
            disabled={!canEditSettings}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="dashboardLayout" className="block text-sm font-medium text-gray-700">Dashboard Layout</label>
          <select
            id="dashboardLayout"
            value={settings.appearance.dashboardLayout}
            onChange={(e) => handleInputChange('appearance', 'dashboardLayout', e.target.value)}
            disabled={!canEditSettings}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="expanded">Expanded</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Primary Color</label>
          <div className="mt-1 flex items-center">
            <input
              type="color"
              id="primaryColor"
              value={settings.appearance.primaryColor}
              onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
              disabled={!canEditSettings}
              className="h-8 w-16 border border-gray-300 rounded-md shadow-sm p-0 disabled:opacity-50"
            />
            <input
              type="text"
              value={settings.appearance.primaryColor}
              onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
              disabled={!canEditSettings}
              className="ml-2 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700">Accent Color</label>
          <div className="mt-1 flex items-center">
            <input
              type="color"
              id="accentColor"
              value={settings.appearance.accentColor}
              onChange={(e) => handleInputChange('appearance', 'accentColor', e.target.value)}
              disabled={!canEditSettings}
              className="h-8 w-16 border border-gray-300 rounded-md shadow-sm p-0 disabled:opacity-50"
            />
            <input
              type="text"
              value={settings.appearance.accentColor}
              onChange={(e) => handleInputChange('appearance', 'accentColor', e.target.value)}
              disabled={!canEditSettings}
              className="ml-2 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showLogo"
            checked={settings.appearance.showLogo}
            onChange={(e) => handleInputChange('appearance', 'showLogo', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="showLogo" className="ml-2 block text-sm text-gray-900">
            Show company logo in header
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="compactMode"
            checked={settings.appearance.compactMode}
            onChange={(e) => handleInputChange('appearance', 'compactMode', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="compactMode" className="ml-2 block text-sm text-gray-900">
            Use compact mode for all tables
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
            Enable email notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="salesAlerts"
            checked={settings.notifications.salesAlerts}
            onChange={(e) => handleInputChange('notifications', 'salesAlerts', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="salesAlerts" className="ml-2 block text-sm text-gray-900">
            Sales threshold alerts
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="targetAlerts"
            checked={settings.notifications.targetAlerts}
            onChange={(e) => handleInputChange('notifications', 'targetAlerts', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="targetAlerts" className="ml-2 block text-sm text-gray-900">
            Target achievement alerts
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="systemNotifications"
            checked={settings.notifications.systemNotifications}
            onChange={(e) => handleInputChange('notifications', 'systemNotifications', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="systemNotifications" className="ml-2 block text-sm text-gray-900">
            System notifications
          </label>
        </div>
      </div>
      
      <div>
        <label htmlFor="notificationDigest" className="block text-sm font-medium text-gray-700">Notification Digest</label>
        <select
          id="notificationDigest"
          value={settings.notifications.notificationDigest}
          onChange={(e) => handleInputChange('notifications', 'notificationDigest', e.target.value)}
          disabled={!canEditSettings}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="realtime">Real-time</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="dataRetentionPeriod" className="block text-sm font-medium text-gray-700">Data Retention Period (months)</label>
        <input
          type="number"
          id="dataRetentionPeriod"
          value={settings.dataSettings.dataRetentionPeriod}
          onChange={(e) => handleInputChange('dataSettings', 'dataRetentionPeriod', parseInt(e.target.value))}
          disabled={!canEditSettings}
          min="1"
          max="120"
          className="mt-1 block w-full sm:w-1/4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        />
        <p className="mt-1 text-sm text-gray-500">How long to keep historical sales data (in months)</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoRefreshDashboard"
            checked={settings.dataSettings.autoRefreshDashboard}
            onChange={(e) => handleInputChange('dataSettings', 'autoRefreshDashboard', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="autoRefreshDashboard" className="ml-2 block text-sm text-gray-900">
            Auto-refresh dashboard
          </label>
        </div>
        
        {settings.dataSettings.autoRefreshDashboard && (
          <div className="ml-6">
            <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-700">Refresh Interval (minutes)</label>
            <input
              type="number"
              id="refreshInterval"
              value={settings.dataSettings.refreshInterval}
              onChange={(e) => handleInputChange('dataSettings', 'refreshInterval', parseInt(e.target.value))}
              disabled={!canEditSettings}
              min="1"
              max="60"
              className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cacheData"
            checked={settings.dataSettings.cacheData}
            onChange={(e) => handleInputChange('dataSettings', 'cacheData', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="cacheData" className="ml-2 block text-sm text-gray-900">
            Cache data locally for faster loading
          </label>
        </div>
      </div>
      
      <div>
        <label htmlFor="defaultDateRange" className="block text-sm font-medium text-gray-700">Default Date Range</label>
        <select
          id="defaultDateRange"
          value={settings.dataSettings.defaultDateRange}
          onChange={(e) => handleInputChange('dataSettings', 'defaultDateRange', e.target.value)}
          disabled={!canEditSettings}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
          <option value="lastWeek">Last Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisQuarter">This Quarter</option>
          <option value="lastQuarter">Last Quarter</option>
          <option value="thisYear">This Year</option>
          <option value="lastYear">Last Year</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
        <input
          type="number"
          id="sessionTimeout"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
          disabled={!canEditSettings}
          min="5"
          max="240"
          className="mt-1 block w-full sm:w-1/4 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        />
        <p className="mt-1 text-sm text-gray-500">How long until inactive users are automatically logged out</p>
      </div>
      
      <div>
        <label htmlFor="passwordPolicy" className="block text-sm font-medium text-gray-700">Password Policy</label>
        <select
          id="passwordPolicy"
          value={settings.security.passwordPolicy}
          onChange={(e) => handleInputChange('security', 'passwordPolicy', e.target.value)}
          disabled={!canEditSettings}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="low">Low (min 6 characters)</option>
          <option value="medium">Medium (min 8 characters, mixed case)</option>
          <option value="high">High (min 10 characters, number, symbol)</option>
          <option value="extreme">Extreme (min 12 characters, strict complexity)</option>
        </select>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="mfaEnabled"
            checked={settings.security.mfaEnabled}
            onChange={(e) => handleInputChange('security', 'mfaEnabled', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="mfaEnabled" className="ml-2 block text-sm text-gray-900">
            Enable Multi-Factor Authentication (MFA)
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoLogout"
            checked={settings.security.autoLogout}
            onChange={(e) => handleInputChange('security', 'autoLogout', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="autoLogout" className="ml-2 block text-sm text-gray-900">
            Auto-logout inactive users
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ipRestriction"
            checked={settings.security.ipRestriction}
            onChange={(e) => handleInputChange('security', 'ipRestriction', e.target.checked)}
            disabled={!canEditSettings}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="ipRestriction" className="ml-2 block text-sm text-gray-900">
            Enable IP address restrictions
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          
          {canEditSettings && (
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  {saveSuccess ? (
                    <>
                      <Check size={18} className="mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Settings
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        {!canEditSettings && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield size={24} className="text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are in view-only mode. Contact an administrator to change settings.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe size={16} className="inline mr-2" />
              General
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              >
              <Monitor size={16} className="inline mr-2" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BellRing size={16} className="inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('dataSettings')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'dataSettings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database size={16} className="inline mr-2" />
              Data Settings
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield size={16} className="inline mr-2" />
              Security
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'dataSettings' && renderDataSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
