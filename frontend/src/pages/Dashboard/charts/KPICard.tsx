import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
  subtitle?: string;
}

export function KPICard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'neutral',
  onClick,
  subtitle 
}: KPICardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return 'fa-arrow-up';
      case 'negative': return 'fa-arrow-down';
      default: return 'fa-minus';
    }
  };

  return (
    <div 
      className={`relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {title}
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
          )}
          {change && (
            <div className={`text-xs mt-2 flex items-center ${getChangeColor()}`}>
              <i className={`fa-solid ${getChangeIcon()} mr-1`}></i>
              {change}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <i className={`fa-solid ${icon} text-indigo-600`}></i>
          </div>
        </div>
      </div>
    </div>
  );
}