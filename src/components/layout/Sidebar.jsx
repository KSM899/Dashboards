// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, Home, TrendingUp, Users, Package, BarChart3, 
  Settings, HelpCircle, Shield, FileText, Sliders, Upload 
} from 'lucide-react'; // ✅ Added Upload icon
import { hasPermission } from '../../services/authService';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Analytics', icon: TrendingUp, path: '/analytics' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { 
      name: 'Import Data', 
      icon: Upload, 
      path: '/import',
      permission: 'IMPORT_DATA' // ✅ Requires IMPORT_DATA permission
    },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Sales Performance', icon: BarChart3, path: '/performance' },
    { name: 'Settings', icon: Sliders, path: '/settings' }
  ];

  if (hasPermission('MANAGE_USERS')) {
    sidebarItems.push({ name: 'User Management', icon: Shield, path: '/users' });
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Sales</span>
              <span className="text-xl font-bold text-gray-700">Dashboard</span>
            </div>
            <button
              className="text-gray-500 focus:outline-none lg:hidden"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {sidebarItems
                .filter(item => !item.permission || hasPermission(item.permission)) // ✅ Permission filter
                .map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-sm rounded-lg ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      <item.icon 
                        size={20} 
                        className={`mr-3 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`} 
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <a
              href="#help"
              className="flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <HelpCircle size={16} className="mr-2" />
              Help & Documentation
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
