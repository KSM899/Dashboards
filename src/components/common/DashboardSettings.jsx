// src/components/common/DashboardSettings.jsx

import React, { useState } from 'react';
import { X, Save, Layout, Eye, Palette, Sliders, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

// Default settings if none are saved
const defaultSettings = {
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
      salesForecast: true // Add this line
    },
    autoRefresh: false,
    refreshInterval: 5, // minutes
    colorTheme: 'default',
    chartStyle: 'default',
    compactView: false
  };
const DashboardSettings = ({ onClose }) => {
    const { settings, updateSettings } = useData();

    // Use settings from context if available, otherwise use defaults
    const dashboardSettings = settings?.dashboardSettings || defaultSettings;

    const [currentSettings, setCurrentSettings] = useState(dashboardSettings);
    const [activeTab, setActiveTab] = useState('visibility');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleToggleSection = (section) => {
        setCurrentSettings(prev => ({
            ...prev,
            visibleSections: {
                ...prev.visibleSections,
                [section]: !prev.visibleSections[section]
            }
        }));
    };

    const handleLayoutChange = (layout) => {
        setCurrentSettings(prev => ({
            ...prev,
            layout
        }));
    };

    const handleToggleSetting = (field) => {
        setCurrentSettings(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSelectChange = (field, value) => {
        setCurrentSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNumberChange = (field, value) => {
        setCurrentSettings(prev => ({
            ...prev,
            [field]: parseInt(value, 10) || 0
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // In a real app, this would be saved via API
            await updateSettings({
                ...settings,
                dashboardSettings: currentSettings
            });

            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            // Show error notification
        } finally {
            setSaving(false);
        }
    };

    const resetToDefaults = () => {
        if (window.confirm('Reset dashboard to default settings? This will discard all your customizations.')) {
            setCurrentSettings(defaultSettings);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Dashboard Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'visibility'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('visibility')}
                    >
                        <Eye size={16} className="inline-block mr-1" />
                        Visibility
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'layout'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('layout')}
                    >
                        <Layout size={16} className="inline-block mr-1" />
                        Layout
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'appearance'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('appearance')}
                    >
                        <Palette size={16} className="inline-block mr-1" />
                        Appearance
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'behavior'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('behavior')}
                    >
                        <Sliders size={16} className="inline-block mr-1" />
                        Behavior
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Visibility Tab */}
                    {activeTab === 'visibility' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-4">Control which sections are visible on your dashboard.</p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">KPI Cards</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.kpiCards}
                                            onChange={() => handleToggleSection('kpiCards')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.kpiCards ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Sales by Category</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.salesByCategory}
                                            onChange={() => handleToggleSection('salesByCategory')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.salesByCategory ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Sales by Region</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.salesByRegion}
                                            onChange={() => handleToggleSection('salesByRegion')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.salesByRegion ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Sales Trends</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.salesTrends}
                                            onChange={() => handleToggleSection('salesTrends')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.salesTrends ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Top Products</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.topProducts}
                                            onChange={() => handleToggleSection('topProducts')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.topProducts ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Top Customers</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.topCustomers}
                                            onChange={() => handleToggleSection('topCustomers')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.topCustomers ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Sales by Rep</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.salesByRep}
                                            onChange={() => handleToggleSection('salesByRep')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.salesByRep ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Target Editor</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.targetEditor}
                                            onChange={() => handleToggleSection('targetEditor')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.targetEditor ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Sales Forecast</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.visibleSections.salesForecast}
                                            onChange={() => handleToggleSection('salesForecast')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.visibleSections.salesForecast ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Layout Tab */}
                    {activeTab === 'layout' && (
                        <div>
                            <p className="text-sm text-gray-500 mb-4">Choose how your dashboard components are arranged.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div
                                    className={`border rounded-lg p-4 cursor-pointer ${currentSettings.layout === 'default' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => handleLayoutChange('default')}
                                >
                                    <div className="h-24 mb-2 bg-gray-200 flex flex-col space-y-1 p-1">
                                        <div className="bg-white h-4 rounded"></div>
                                        <div className="flex space-x-1 h-8">
                                            <div className="bg-white w-1/3 rounded"></div>
                                            <div className="bg-white w-1/3 rounded"></div>
                                            <div className="bg-white w-1/3 rounded"></div>
                                        </div>
                                        <div className="flex space-x-1 flex-1">
                                            <div className="bg-white w-1/2 rounded"></div>
                                            <div className="bg-white w-1/2 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="text-center text-sm font-medium">Default</div>
                                </div>

                                <div
                                    className={`border rounded-lg p-4 cursor-pointer ${currentSettings.layout === 'compact' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => handleLayoutChange('compact')}
                                >
                                    <div className="h-24 mb-2 bg-gray-200 flex flex-col space-y-1 p-1">
                                        <div className="bg-white h-3 rounded"></div>
                                        <div className="flex space-x-1 h-5">
                                            <div className="bg-white w-1/4 rounded"></div>
                                            <div className="bg-white w-1/4 rounded"></div>
                                            <div className="bg-white w-1/4 rounded"></div>
                                            <div className="bg-white w-1/4 rounded"></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 flex-1">
                                            <div className="bg-white rounded"></div>
                                            <div className="bg-white rounded"></div>
                                            <div className="bg-white rounded"></div>
                                            <div className="bg-white rounded"></div>
                                            <div className="bg-white rounded"></div>
                                            <div className="bg-white rounded"></div>
                                        </div>
                                    </div>
                                    <div className="text-center text-sm font-medium">Compact</div>
                                </div>

                                <div
                                    className={`border rounded-lg p-4 cursor-pointer ${currentSettings.layout === 'focused' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => handleLayoutChange('focused')}
                                >
                                    <div className="h-24 mb-2 bg-gray-200 flex flex-col space-y-1 p-1">
                                        <div className="bg-white h-4 rounded"></div>
                                        <div className="flex space-x-1 h-8">
                                            <div className="bg-white w-1/3 rounded"></div>
                                            <div className="bg-white w-1/3 rounded"></div>
                                            <div className="bg-white w-1/3 rounded"></div>
                                        </div>
                                        <div className="bg-white flex-1 rounded"></div>
                                    </div>
                                    <div className="text-center text-sm font-medium">Focused</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={currentSettings.compactView}
                                        onChange={() => handleToggleSetting('compactView')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Compact view (reduce padding and margins)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div>
                            <p className="text-sm text-gray-500 mb-4">Customize the appearance of your dashboard.</p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                                <select
                                    value={currentSettings.colorTheme}
                                    onChange={(e) => handleSelectChange('colorTheme', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="default">Default (Blue)</option>
                                    <option value="green">Green</option>
                                    <option value="purple">Purple</option>
                                    <option value="orange">Orange</option>
                                    <option value="red">Red</option>
                                    <option value="gray">Monochrome</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chart Style</label>
                                <select
                                    value={currentSettings.chartStyle}
                                    onChange={(e) => handleSelectChange('chartStyle', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="default">Default</option>
                                    <option value="vibrant">Vibrant</option>
                                    <option value="pastel">Pastel</option>
                                    <option value="monochrome">Monochrome</option>
                                    <option value="gradient">Gradient</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Behavior Tab */}
                    {activeTab === 'behavior' && (
                        <div>
                            <p className="text-sm text-gray-500 mb-4">Configure how your dashboard behaves.</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                            type="checkbox"
                                            checked={currentSettings.autoRefresh}
                                            onChange={() => handleToggleSetting('autoRefresh')}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        />
                                        <label
                                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentSettings.autoRefresh ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                        ></label>
                                    </div>
                                </div>

                                {currentSettings.autoRefresh && (
                                    <div className="ml-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval (minutes)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={currentSettings.refreshInterval}
                                            onChange={(e) => handleNumberChange('refreshInterval', e.target.value)}
                                            className="w-20 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                    <button
                        onClick={resetToDefaults}
                        className="text-sm text-gray-700 hover:text-gray-900"
                    >
                        Reset to defaults
                    </button>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                        >
                            {saving ? 'Saving...' : saved ?
                                <span className="flex items-center">
                                    <Check size={16} className="mr-1" /> Saved
                                </span> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add custom styles for toggle switches */}
            <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #3b82f6;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 5;
          opacity: 0;
          width: 100%;
          height: 100%;
        }
        .toggle-label {
          width: 100%;
          height: 100%;
          background-color: #d1d5db;
          border-radius: 9999px;
          transition: background-color 0.2s ease;
        }
      `}</style>
        </div>
    );
};

export default DashboardSettings;