import React from 'react';
import { getLegendColor } from './NetworkGraph';

interface StatisticItem {
  name: string;
  count: number;
}

interface NetworkStatisticsProps {
  statistics: StatisticItem[];
}

// Optional: Map names to display labels and colors
const STAT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  TotalNodes: { label: 'Nodes', bg: 'bg-blue-50', text: 'text-blue-900' },
  TotalEdges: { label: 'Connections', bg: 'bg-green-50', text: 'text-green-900' },
  HighRisk: { label: 'High Risk', bg: 'bg-red-50', text: 'text-red-900' },
  LAN: { label: 'LAN', bg: 'bg-emerald-50', text: 'text-emerald-900' },
  DMZ: { label: 'DMZ', bg: 'bg-indigo-50', text: 'text-indigo-900' },
  External: { label: 'External', bg: 'bg-orange-50', text: 'text-orange-900' },

};

const NetworkStatistics: React.FC<NetworkStatisticsProps> = ({ statistics }) => {
  const safeStatistics = Array.isArray(statistics) ? statistics : [];
  return (
    <div className="bg-white border-b border-gray-200 p-2">
      <div className="flex flex-wrap gap-4">
        {safeStatistics.map((stat) => {
          const config = STAT_LABELS[stat.name] || {
            label: stat.name,
            bg: 'bg-gray-50',
            text: 'text-gray-900',
          };
          return (
            <div key={stat.name} className="flex items-center gap-2 p-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getLegendColor(stat.name) }}
              />
              <span className="text-md font-medium">{stat.count}</span>
              <span className="text-md text-gray-500">{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkStatistics;