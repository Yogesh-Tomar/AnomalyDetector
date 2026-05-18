import React from 'react';

export interface BaseChartProps {
  loading: boolean;
  error: string | null;
  height?: number;
  className?: string;
}

export function ChartContainer({ 
  loading, 
  error, 
  height = 300, 
  className = "", 
  children 
}: BaseChartProps & { children: React.ReactNode }) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: `${height}px` }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="text-gray-500">Loading chart data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: `${height}px` }}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <i className="fa-solid fa-exclamation-triangle text-2xl"></i>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <div className={className} style={{ height: `${height}px` }}>{children}</div>;
}