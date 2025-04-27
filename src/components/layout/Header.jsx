// src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, Bell, User, LogOut, Settings, ChevronDown, 
  Search, Calendar, Check, ArrowUpRight, RefreshCw 
} from 'lucide-react';
import { logout, getCurrentUser } from '../../services/authService';

const Header = ({ onMenuClick }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(2);
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [searchQuery, setSearchQuery] = useState('');
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const dateRangeRef = useRef(null);
  const searchRef = useRef(null);
  
  const currentUser = getCurrentUser();
  
  // Mock notifications data
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        title: 'Monthly sales target reached!',
        message: 'Congratulations! Your team has reached 105% of the monthly sales target.',
        time: '2 hours ago',
        type: 'success',
        read: false
      },
      {
        id: 2,
        title: 'New customer signed up',
        message: 'Global Industries Inc. has been added as a new customer.',
        time: '1 day ago',
        type: 'info',
        read: false
      },
      {
        id: 3,
        title: 'Product inventory low',
        message: 'Premium Widget A is running low in stock (5 units remaining).',
        time: '2 days ago',
        type: 'warning',
        read: true
      },
      {
        id: 4,
        title: 'Weekly report generated',
        message: 'Your weekly sales performance report is now available for review.',
        time: '5 days ago',
        type: 'info',
        read: true
      }
    ]);
  }, []);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
        setDateRangeOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    setUnreadCount(0);
  };
  
  const markNotificationAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === id && !notification.read) {
        setUnreadCount(prev => prev - 1);
        return { ...notification, read: true };
      }
      return notification;
    });
    setNotifications(updatedNotifications);
  };
  
  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    setDateRangeOpen(false);
  };
  
  // Format date range for display
  const getDateRangeLabel = () => {
    switch (selectedDateRange) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'thisWeek': return 'This Week';
      case 'lastWeek': return 'Last Week';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'thisQuarter': return 'This Quarter';
      case 'lastQuarter': return 'Last Quarter';
      case 'thisYear': return 'This Year';
      case 'lastYear': return 'Last Year';
      case 'custom': return 'Custom Range';
      default: return 'This Month';
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <Check size={16} className="text-green-500" />;
      case 'warning': return <Bell size={16} className="text-yellow-500" />;
      case 'error': return <Bell size={16} className="text-red-500" />;
      case 'info':
      default: return <Bell size={16} className="text-blue-500" />;
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Left section */}
        <div className="flex items-center">
          <button
            className="text-gray-500 mr-4 focus:outline-none lg:hidden"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600 mr-2">Sales</span>
            <span className="text-xl font-bold text-gray-700">Dashboard</span>
          </Link>
          
          {/* Search bar */}
          <div className="hidden md:flex ml-6 relative" ref={searchRef}>
            <div className="relative w-64">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
            </div>
            
            {/* Search dropdown */}
            {searchOpen && searchQuery.length > 0 && (
              <div className="absolute z-10 mt-1 w-96 bg-white shadow-lg rounded-md border border-gray-200 py-1">
                <div className="p-2 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                  <div className="px-3 py-2 hover:bg-gray-50 rounded-md">
                    <div className="text-sm font-medium text-gray-900">North Region Sales</div>
                    <div className="text-xs text-gray-500">Dashboard</div>
                  </div>
                  <div className="px-3 py-2 hover:bg-gray-50 rounded-md">
                    <div className="text-sm font-medium text-gray-900">Premium Widget A</div>
                    <div className="text-xs text-gray-500">Product</div>
                  </div>
                  <div className="px-3 py-2 hover:bg-gray-50 rounded-md">
                    <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                    <div className="text-xs text-gray-500">Settings</div>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                    <Search size={12} className="mr-1" />
                    Search for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right section */}
        <div className="flex items-center">
          {/* Date selector */}
          <div className="hidden md:flex relative" ref={dateRangeRef}>
            <button
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
            >
              <Calendar size={16} className="mr-2" />
              <span>{getDateRangeLabel()}</span>
              <ChevronDown size={16} className="ml-2" />
            </button>
            
            {dateRangeOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-2 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500">SELECT RANGE</h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <div className="py-1">
                    {[
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
                    ].map(range => (
                      <button
                        key={range.id}
                        className={`flex items-center justify-between w-full px-4 py-2 text-sm ${
                          selectedDateRange === range.id 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleDateRangeChange(range.id)}
                      >
                        {range.label}
                        {selectedDateRange === range.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedDateRange === 'custom' && (
                  <div className="p-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input 
                          type="date" 
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                    <button className="mt-2 w-full bg-blue-600 text-white text-sm py-1 px-2 rounded">
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Refresh Button */}
          <button
            className="ml-2 p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none md:ml-4"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          
          {/* Notifications */}
          <div className="relative ml-2 md:ml-4" ref={notificationsRef}>
            <button
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <Bell size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <a href="#allNotifications" className="text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center">
                    View all notifications
                    <ArrowUpRight size={12} className="ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative ml-3" ref={userMenuRef}>
            <button
              className="flex items-center text-gray-700 focus:outline-none"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">{currentUser?.name || 'User'}</span>
              <ChevronDown size={16} className="ml-1 text-gray-500" />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email || 'user@example.com'}</p>
                </div>
                
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;