import React, { useState, useCallback } from 'react';
import { ChartCard } from '../charts/ChartCard';
import { DriftTrendChart } from '../charts/DriftTrendChart';
import { DateFilterSection } from '../components/DateFilterSection';
import { useEntityMonitoringTab } from '../../../hooks/useEntityMonitoringTab'; // Add this import
import DataQualityCharts from '../charts/DataQualityMetrics';

interface EntityMonitoringTabProps {
  filter: string;
  setFilter: (filter: string) => void;
  customFrom: string;
  setCustomFrom: (from: string) => void;
  customTo: string;
  setCustomTo: (to: string) => void;
}

export default function EntityMonitoringTab({ filter, setFilter, customFrom, setCustomFrom, customTo, setCustomTo }: EntityMonitoringTabProps) {
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const onDateChange = useCallback((range: { from: string; to: string } | null) => {
    setDateRange(range);
  }, []);

  // Replace local state with hook
  const {
    duplicateRate: { data: duplicateRateData, loading: duplicateRateLoading, error: duplicateRateError },
    driftTrend: { data: driftTrendData, loading: driftTrendLoading, error: driftTrendError },
    initCoverage: { data: initCoverageData, loading: initCoverageLoading, error: initCoverageError }
  } = useEntityMonitoringTab(dateRange?.from, dateRange?.to);

  return (
    <div className="space-y-6">
      <DateFilterSection filter={filter} setFilter={setFilter} onDateChange={onDateChange} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />
      
      <ChartCard 
        title="Data Quality Metrics" 
        subtitle="Event processing statistics"
        >
        <DataQualityCharts  
          data={duplicateRateData}
          loading={duplicateRateLoading}
          error={duplicateRateError}
        />
      </ChartCard>      
      
      {/* Drift Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Drift Trend" 
          subtitle="Daily entity drift counts"
          onExport={(format) => console.log(`Export drift trend as ${format}`)}
        >
          <DriftTrendChart
            data={driftTrendData ? driftTrendData.map(item => ({ date: item.d, entitiesDrifted: item.entities_drifted })) : null} // Map API data to component format
            loading={driftTrendLoading}
            error={driftTrendError}
            onDataPointClick={(date, count) => console.log(`${date}: ${count} drifted`)}
          />
        </ChartCard>
        
        <ChartCard 
          title="Initialization Coverage" 
          subtitle="Coverage by agent"
        >
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {initCoverageLoading ? (
              <div>Loading...</div>
            ) : initCoverageError ? (
              <div>Error: {initCoverageError}</div>
            ) : initCoverageData ? (
              initCoverageData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="font-mono text-sm">{item.agentId}</div>
                    <div className="text-xs text-gray-500">{item.totalEntities} entities</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${item.percentInitialized}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.percentInitialized?.toFixed(1)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div>No data available</div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

