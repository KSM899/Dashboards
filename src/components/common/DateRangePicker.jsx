// src/components/common/DateRangePicker.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Check, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

const DateRangePicker = () => {
  const { filters, updateFilters } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState(
    filters.dateRange.start.toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    filters.dateRange.end.toISOString().split('T')[0]
  );
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'lastWeek', label: 'Last Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisQuarter', label: 'This Quarter' },
    { id: 'lastQuarter', label: 'Last Quarter' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'lastYear', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const applyPreset = (presetId) => {
    setSelectedPreset(presetId);
    
    const today = new Date();
    let start, end;
    
    switch (presetId) {
      case 'today':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        start = new Date();
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastWeek':
        start = new Date();
        start.setDate(start.getDate() - start.getDay() - 7);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastQuarter':
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        start = new Date(year, adjustedQuarter * 3, 1);
        end = new Date(year, adjustedQuarter * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        // Don't do anything for custom, let the user pick the dates
        return;
      default:
        return;
    }
    
    setCustomStartDate(start.toISOString().split('T')[0]);
    setCustomEndDate(end.toISOString().split('T')[0]);
    
    if (presetId !== 'custom') {
      updateFilters({
        dateRange: { start, end }
      });
      setIsOpen(false);
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setCustomStartDate(newStartDate);
    setSelectedPreset('custom');
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setCustomEndDate(newEndDate);
    setSelectedPreset('custom');
  };

  const applyCustomDateRange = () => {
    const start = new Date(customStartDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(customEndDate);
    end.setHours(23, 59, 59, 999);
    
    updateFilters({
      dateRange: { start, end }
    });
    
    setIsOpen(false);
  };

  // Get the display label for the current date range
  const getDateRangeLabel = () => {
    if (selectedPreset !== 'custom') {
      const preset = presets.find(p => p.id === selectedPreset);
      return preset ? preset.label : 'Select Date Range';
    }

    // Format dates for display
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };

    return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Calendar size={16} className="mr-2 text-gray-500" />
        <span>{getDateRangeLabel()}</span>
        <ChevronDown size={16} className="ml-2 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Select Date Range</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
              <X size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {presets.slice(0, 10).map((preset) => (
              <button
                key={preset.id}
                className={`text-left px-3 py-2 text-sm rounded-md ${
                  selectedPreset === preset.id 
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-3 mb-3">
            <button
              className={`text-left w-full px-3 py-2 text-sm rounded-md ${
                selectedPreset === 'custom' 
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => applyPreset('custom')}
            >
              Custom Range
            </button>
          </div>
          
          {selectedPreset === 'custom' && (
            <div className="mt-3 mb-4">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={handleStartDateChange}
                    max={customEndDate}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={handleEndDateChange}
                    min={customStartDate}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={applyCustomDateRange}
                className="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Custom Range
              </button>
            </div>
          )}
          
          <div className="text-xs text-gray-500 italic">
            Tip: Select a preset or define a custom date range to filter your data.
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;