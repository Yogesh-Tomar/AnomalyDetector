import React, { useState, useCallback } from 'react';
import { ChartCard } from '../charts/ChartCard';
import { NoiseAnalysisChart } from '../charts/NoiseAnalysisChart';
import { KPICard } from '../charts/KPICard';
import { DateFilterSection } from '../components/DateFilterSection';
import { SuppressionTrendChart } from '../charts/SuppressionTrendChart'; // Add this import
import { useOperationsTab } from '../../../hooks/useOperationsTab'; // Add this import

// Simple Modal component
function InfoModal({ open, onClose, info }: { open: boolean, onClose: () => void, info: { name: string, count: number, hostname: string } | null }) {
  if (!open || !info) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
        <h2 className="text-lg font-bold mb-2">Details</h2>
        <div className="mb-4">
          <div><strong>Name:</strong> {info.name}</div>
          <div><strong>Alert Count:</strong> {info.count}</div>
          <div><strong>Hostname:</strong> {info.hostname}</div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

interface OperationsTabProps {
  filter: string;
  setFilter: (filter: string) => void;
  customFrom: string;
  setCustomFrom: (from: string) => void;
  customTo: string;
  setCustomTo: (to: string) => void;
}

export default function OperationsTab({ filter, setFilter, customFrom, setCustomFrom, customTo, setCustomTo }: OperationsTabProps) {
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [kpiData, setKpiData] = useState({
    events: { value: '103,126', change: '+5.2%', changeType: 'positive' as const },
    alerts: { value: '1,018', change: '-2.1%', changeType: 'negative' as const },
    entities: { value: '17,533', change: '+1.8%', changeType: 'positive' as const },
    critical: { value: '47', change: '+12.5%', changeType: 'negative' as const }
  });
  const [modalInfo, setModalInfo] = useState<{ name: string, count: number, hostname: string } | null>(null);

  const onDateChange = useCallback((range: { from: string; to: string } | null) => {
    setDateRange(range);
  }, []);

  // Replace local state with hook
  const {
    topAgents: { data: topAgentsData, loading: topAgentsLoading, error: topAgentsError },
    topUsers: { data: topUsersData, loading: topUsersLoading, error: topUsersError },
    topProcesses: { data: topProcessesData, loading: topProcessesLoading, error: topProcessesError },
    suppressionTrend: { data: suppressionTrendData, loading: suppressionTrendLoading, error: suppressionTrendError }
  } = useOperationsTab(dateRange?.from, dateRange?.to);

  // Handler for bar click
  const handleBarClick = (name: string, count: number, hostname: string) => {
    setModalInfo({ name, count, hostname });
  };

  return (
    <div className="space-y-6">
      <DateFilterSection filter={filter} setFilter={setFilter} onDateChange={onDateChange} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />
      
      {/* Noise Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Noisiest Agents" 
          subtitle="Agents generating most alerts"
          onExport={(format) => console.log(`Export noisy agents as ${format}`)}
        >
          <NoiseAnalysisChart
            data={topAgentsData} // Use hook data
            loading={topAgentsLoading}
            error={topAgentsError}
            title=""
            onBarClick={handleBarClick}
          />
        </ChartCard>
        
        <ChartCard 
          title="Noisiest Users" 
          subtitle="Users generating most alerts"
          onExport={(format) => console.log(`Export noisy users as ${format}`)}
        >
          <NoiseAnalysisChart
            data={topUsersData} // Use hook data
            loading={topUsersLoading}
            error={topUsersError}
            title=""
            onBarClick={handleBarClick}
          />
        </ChartCard>
        
        <ChartCard 
          title="Noisiest Processes" 
          subtitle="Processes generating most alerts"
          onExport={(format) => console.log(`Export noisy processes as ${format}`)}
        >
          <NoiseAnalysisChart
            data={topProcessesData} // Use hook data
            loading={topProcessesLoading}
            error={topProcessesError}
            title=""
            onBarClick={handleBarClick}
          />
        </ChartCard>
      </div>

      {/* Suppression Metrics */}
      <ChartCard 
        title="Alert Suppression Trends" 
        subtitle="Whitelisted and muted alerts over time"
        onExport={(format) => console.log(`Export suppression trends as ${format}`)}
      >
        {/* Replace placeholder with actual chart */}
        <SuppressionTrendChart
          data={suppressionTrendData}
          loading={suppressionTrendLoading}
          error={suppressionTrendError}
        />
      </ChartCard>

      {/* Modal for bar info */}
      <InfoModal open={!!modalInfo} onClose={() => setModalInfo(null)} info={modalInfo} />
    </div>
  );
}


