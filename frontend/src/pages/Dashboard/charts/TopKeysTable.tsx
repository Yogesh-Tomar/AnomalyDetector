import React, { useState } from 'react';
import { ChartContainer, BaseChartProps } from './BaseChart';

export interface TopKeyData {
  key: string;
  zLoad: number;
  alertCount: number;
}

interface TopKeysTableProps extends BaseChartProps {
  data: TopKeyData[] | null;
  onRowClick?: (key: string) => void;
}

export function TopKeysTable({ 
  data, 
  loading, 
  error, 
  height = 300,
  onRowClick 
}: TopKeysTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TopKeyData;
    direction: 'asc' | 'desc';
  }>({ key: 'zLoad', direction: 'desc' });

  const sortedData = data ? [...data].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  const handleSort = (key: keyof TopKeyData) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSeverityColor = (zLoad: number) => {
    if (zLoad >= 50) return 'text-red-600 bg-red-50';
    if (zLoad >= 20) return 'text-orange-600 bg-orange-50';
    if (zLoad >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      <div className="overflow-y-auto" style={{ height: height - 20 }}>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th 
                className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('key')}
              >
                <div className="flex items-center">
                  Key
                  {sortConfig.key === 'key' && (
                    <i className={`fa-solid fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1 text-xs`}></i>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('zLoad')}
              >
                <div className="flex items-center justify-end">
                  Z-Load
                  {sortConfig.key === 'zLoad' && (
                    <i className={`fa-solid fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1 text-xs`}></i>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('alertCount')}
              >
                <div className="flex items-center justify-end">
                  Alerts
                  {sortConfig.key === 'alertCount' && (
                    <i className={`fa-solid fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1 text-xs`}></i>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(item.key)}
              >
                <td className="px-4 py-3">
                  <div className="max-w-sm font-mono text-xs" title={item.key}>
                    {item.key}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.zLoad)}`}>
                    {item.zLoad?.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium">{item.alertCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedData.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </ChartContainer>
  );
}
