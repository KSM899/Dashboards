// src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// Create context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Remove notification after it expires
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, notifications[0].duration || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);
  
  // Add a new notification
  const addNotification = (type, message, options = {}) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type,
      message,
      duration: options.duration || 5000,
      ...options
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };
  
  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  // Shorthand methods for different notification types
  const success = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.SUCCESS, message, options);
  
  const error = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.ERROR, message, options);
  
  const info = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.INFO, message, options);
  
  const warning = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.WARNING, message, options);
  
  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    info,
    warning
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notification display */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
          {notifications.map((notification) => (
            <Notification 
              key={notification.id} 
              notification={notification} 
              onClose={() => removeNotification(notification.id)} 
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// Individual Notification component
const Notification = ({ notification, onClose }) => {
  const { id, type, message, title } = notification;
  
  // Determine styles based on notification type
  const getTypeStyles = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          containerClass: 'bg-green-50 border-green-400',
          iconClass: 'text-green-400',
          icon: <CheckCircle size={20} />,
          titleClass: 'text-green-800',
          messageClass: 'text-green-700'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          containerClass: 'bg-red-50 border-red-400',
          iconClass: 'text-red-400',
          icon: <AlertCircle size={20} />,
          titleClass: 'text-red-800',
          messageClass: 'text-red-700'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          containerClass: 'bg-yellow-50 border-yellow-400',
          iconClass: 'text-yellow-400',
          icon: <AlertCircle size={20} />,
          titleClass: 'text-yellow-800',
          messageClass: 'text-yellow-700'
        };
      case NOTIFICATION_TYPES.INFO:
      default:
        return {
          containerClass: 'bg-blue-50 border-blue-400',
          iconClass: 'text-blue-400',
          icon: <Info size={20} />,
          titleClass: 'text-blue-800',
          messageClass: 'text-blue-700'
        };
    }
  };
  
  const styles = getTypeStyles();
  
  return (
    <div 
      className={`border-l-4 p-4 rounded shadow-md ${styles.containerClass} animate-fade-in`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.iconClass}`}>
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <p className={`text-sm font-medium ${styles.titleClass}`}>
              {title}
            </p>
          )}
          <p className={`text-sm ${styles.messageClass}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 text-gray-400 hover:text-gray-500`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationContext;