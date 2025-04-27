
// src/components/dashboard/KpiCard.jsx

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * KPI Card component for displaying key performance metrics
 * 
 * @param {Object} props Component props
 * @param {string} props.title The title of the KPI card
 * @param {string|number} props.value The main value to display
 * @param {string|React.ReactNode} props.icon Icon to display
 * @param {string} props.iconBgColor Background color for the icon
 * @param {string} props.iconColor Color for the icon
 * @param {number} props.changeValue Percentage change from previous period
 * @param {string} props.changePeriod Text describing the comparison period
 * @param {React.ReactNode} props.footer Additional content for the footer
 * @param {string} props.tooltipText Tooltip text for more information
 */
const KpiCard = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-500',
  changeValue,
  changePeriod = 'vs previous period',
  footer,
  tooltipText,
  className,
  ...props
}) => {
  // Determine if change is positive, negative, or neutral
  const isPositiveChange = changeValue > 0;
  const isNeutralChange = changeValue === 0;
  
  // Dynamic classes based on change value
  const changeColorClass = isPositiveChange 
    ? 'text-green-500' 
    : isNeutralChange 
      ? 'text-gray-500' 
      : 'text-red-500';
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-6 ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${iconBgColor}`}>
            {React.isValidElement(icon) 
              ? React.cloneElement(icon, { className: iconColor, size: 24 })
              : <div className={`${iconColor}`}>{icon}</div>
            }
          </div>
        )}
      </div>
      
      {(changeValue !== undefined || footer) && (
        <div className="mt-4">
          {changeValue !== undefined && (
            <div className="flex items-center">
              <div className="flex items-center">
                {isPositiveChange ? (
                  <TrendingUp size={16} className={changeColorClass} />
                ) : !isNeutralChange ? (
                  <TrendingDown size={16} className={changeColorClass} />
                ) : null}
                <span className={`text-sm font-medium ml-1 ${changeColorClass}`}>
                  {isPositiveChange ? '+' : ''}{changeValue.toFixed(1)}%
                </span>
              </div>
              {changePeriod && (
                <span className="text-sm text-gray-500 ml-2">{changePeriod}</span>
              )}
            </div>
          )}
          
          {footer && (
            <div className="mt-2">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KpiCard;