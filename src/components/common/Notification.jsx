// src/components/common/Notification.jsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X, XCircle } from 'lucide-react';

// Types of notifications
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

/**
 * Individual Notification Component
 * 
 * @param {Object} props
 * @param {Object} props.notification - Notification data object
 * @param {string} props.notification.id - Unique ID
 * @param {string} props.notification.type - Type of notification
 * @param {string} props.notification.message - Main notification message
 * @param {string} props.notification.title - Optional title
 * @param {number} props.notification.duration - Duration in ms before auto-closing
 * @param {Function} props.onClose - Function to call when closing notification
 */
const Notification = ({ notification, onClose }) => {
  const { id, type, message, title, duration = 5000 } = notification;
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Handle auto-close after duration
  useEffect(() => {
    if (duration > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, isPaused]);
  
  // Handle animation end and actually remove notification
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        onClose();
      }, 300); // Match animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isExiting, onClose]);
  
  // Determine styles based on notification type
  const getTypeStyles = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          containerClass: 'bg-green-50 border-green-400',
          iconClass: 'text-green-500',
          icon: <CheckCircle size={20} />,
          titleClass: 'text-green-800',
          messageClass: 'text-green-700',
          progressClass: 'bg-green-400'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          containerClass: 'bg-red-50 border-red-400',
          iconClass: 'text-red-500',
          icon: <XCircle size={20} />,
          titleClass: 'text-red-800',
          messageClass: 'text-red-700',
          progressClass: 'bg-red-400'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          containerClass: 'bg-yellow-50 border-yellow-400',
          iconClass: 'text-yellow-500',
          icon: <AlertTriangle size={20} />,
          titleClass: 'text-yellow-800',
          messageClass: 'text-yellow-700',
          progressClass: 'bg-yellow-400'
        };
      case NOTIFICATION_TYPES.INFO:
      default:
        return {
          containerClass: 'bg-blue-50 border-blue-400',
          iconClass: 'text-blue-500',
          icon: <Info size={20} />,
          titleClass: 'text-blue-800',
          messageClass: 'text-blue-700',
          progressClass: 'bg-blue-400'
        };
    }
  };
  
  const styles = getTypeStyles();
  
  // Handle close button click
  const handleClose = () => {
    setIsExiting(true);
  };
  
  return (
    <div 
      className={`border-l-4 p-4 rounded-md shadow-md ${styles.containerClass} relative overflow-hidden 
                 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
                 transition-opacity duration-300`}
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
          onClick={handleClose}
          className={`ml-4 text-gray-400 hover:text-gray-500`}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Progress bar */}
      {duration > 0 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1">
          <div 
            className={`h-full ${styles.progressClass} transition-all`} 
            style={{ 
              animation: `progress ${duration / 1000}s linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * NotificationList Component - Displays multiple notifications
 * 
 * @param {Object} props
 * @param {Array} props.notifications - Array of notification objects
 * @param {Function} props.onClose - Function to call when closing a notification
 */
export const NotificationList = ({ notifications = [], onClose }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Notification 
          key={notification.id} 
          notification={notification} 
          onClose={() => onClose(notification.id)} 
        />
      ))}
    </div>
  );
};

export default Notification;