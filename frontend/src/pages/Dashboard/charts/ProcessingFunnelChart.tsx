import React from 'react';
import { ChartContainer, BaseChartProps } from './BaseChart';

export interface FunnelData {
  eventsCount: number;
  statsRecordCount: number;
  alertsCount: number;
}

interface ProcessingFunnelChartProps extends BaseChartProps {
  data: FunnelData | null;
  onStageClick?: (stage: string, count: number) => void;
}

export function ProcessingFunnelChart({ 
  data, 
  loading, 
  error, 
  height = 200,
  onStageClick 
}: ProcessingFunnelChartProps) {
  if (!data) return <ChartContainer loading={loading} error={error} height={height}><div></div></ChartContainer>;

  const maxValue = Math.max(data.eventsCount, data.statsRecordCount, data.alertsCount);
  const stages = [
    { name: 'Events', count: data.eventsCount, color: 'bg-blue-500', icon: 'fa-database' },
    { name: 'Stats', count: data.statsRecordCount, color: 'bg-indigo-500', icon: 'fa-chart-bar' },
    { name: 'Alerts', count: data.alertsCount, color: 'bg-red-500', icon: 'fa-bell' }
  ];

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      <div className="flex items-center justify-center space-x-8 h-full">
        {stages.map((stage, index) => {
          const widthPercent = (stage.count / maxValue) * 100;
          const conversionRate = index > 0 ? ((stage.count / stages[index - 1].count) * 100).toFixed(1) : '100.0';
          
          return (
            <div key={stage.name} className="flex flex-col items-center">
              {/* Stage Box */}
              <div
                className={`${stage.color} text-white rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity mb-2`}
                style={{ width: `${Math.max(80, widthPercent)}px`, minWidth: '80px' }}
                onClick={() => onStageClick?.(stage.name.toLowerCase(), stage.count)}
              >
                <div className="text-center">
                  <i className={`fa-solid ${stage.icon} text-xl mb-2`}></i>
                  <div className="text-lg font-bold">{stage?.count ?? 0}</div>
                  <div className="text-xs opacity-90">{stage.name}</div>
                </div>
              </div>
              
              {/* Conversion Rate */}
              {/* {index > 0 && (
                <div className="text-xs text-gray-500">
                  {conversionRate}% conversion
                </div>
              )} */}
              
              {/* Arrow */}
              {/* {index < stages.length - 1 && (
                <div className="absolute" style={{ left: '100%', top: '50%', transform: 'translateY(-50%)' }}>
                  <i className="fa-solid fa-arrow-right text-gray-400 text-xl mx-4"></i>
                </div>
              )} */}
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
}