import React, { useState } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  fullscreen?: boolean;
  onExport?: (format: 'png' | 'pdf' | 'csv') => void;
}

export function ChartCard({ 
  title, 
  subtitle, 
  children, 
  actions, 
  fullscreen = false,
  onExport 
}: ChartCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'png' | 'pdf' | 'csv') => {
    onExport?.(format);
    setShowExportMenu(false);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          
          {/* Export Menu */}
          {/* {onExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Export chart"
              >
                <i className="fa-solid fa-download text-gray-400 hover:text-gray-600"></i>
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => handleExport('png')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <i className="fa-solid fa-image mr-2"></i>PNG
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <i className="fa-solid fa-file-pdf mr-2"></i>PDF
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <i className="fa-solid fa-file-csv mr-2"></i>CSV
                  </button>
                </div>
              )}
            </div>
          )} */}
          
          {/* Fullscreen Toggle */}
          {fullscreen && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-gray-400 hover:text-gray-600`}></i>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
      
      {/* Fullscreen overlay close */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
        >
          <i className="fa-solid fa-times text-gray-600"></i>
        </button>
      )}
    </div>
  );
}