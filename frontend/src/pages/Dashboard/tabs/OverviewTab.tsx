import React, { useState, useCallback } from 'react';
import { ChartCard } from '../charts/ChartCard';
import { KPICard } from '../charts/KPICard';
import { AgentHealthChart } from '../charts/AgentHealthChart';
import { DateFilterSection } from '../components/DateFilterSection';
import { EventsPerHourChart, HeatmapChart, TopKeysChart, TopProcessesChart, TopUsersChart } from '../../DashboardCharts';
import { useDashboardKPIs, useEventsPerHour, useHeatmapData, useTopItems, useAgentHealth } from '../../../hooks/useDashboard';

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

interface OverviewTabProps {
  filter: string;
  setFilter: (filter: string) => void;
  customFrom: string;
  setCustomFrom: (from: string) => void;
  customTo: string;
  setCustomTo: (to: string) => void;
}

export default function OverviewTab({ filter, setFilter, customFrom, setCustomFrom, customTo, setCustomTo }: OverviewTabProps) {
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const onDateChange = useCallback((range: { from: string; to: string } | null) => {
    setDateRange(range);
  }, []);

  // Use hooks for all data
  const kpisHook = useDashboardKPIs(dateRange?.from, dateRange?.to);
  const eventsPerHourHook = useEventsPerHour(dateRange?.from, dateRange?.to);
  const heatmapHook = useHeatmapData(dateRange?.from, dateRange?.to);
  const topProcessesHook = useTopItems('processes', dateRange?.from, dateRange?.to, 10);
  const topUsersHook = useTopItems('users', dateRange?.from, dateRange?.to, 10);
  const topKeysHook = useTopItems('keys', dateRange?.from, dateRange?.to, 10);
  const agentHealthHook = useAgentHealth(dateRange?.from, dateRange?.to);
  const [modalInfo, setModalInfo] = useState<{ name: string, count: number, hostname: string } | null>(null);
  // Derive KPI data from hook
  const kpiData = kpisHook.data ? {
    events: { value: kpisHook.data.totalEvents?.toLocaleString() },
    entities: { value: kpisHook.data.totalEntities?.toLocaleString() },
    initialized: { value: kpisHook.data.initializedPercentage ? kpisHook.data.initializedPercentage + '%' : '0%' },
    outliers: { value: kpisHook.data.outliers?.toLocaleString() }
  } : {
    events: { value: '0' },
    entities: { value: '0' },
    initialized: { value: '0%' },
    outliers: { value: '0' }
  };

  const handleKpiClick = (kpiType: string) => {
    // Navigate to relevant filtered view
    console.log(`Navigate to ${kpiType} details`);
  };

  const handleChartExport = (chartName: string, format: 'png' | 'pdf' | 'csv') => {
    console.log(`Export ${chartName} as ${format}`);
    // Implement export functionality
  };

   const handleBarClick = (name: string, count: number, hostname: string) => {
    setModalInfo({ name, count, hostname });
  };

  return (
    <div className="space-y-6">
      <DateFilterSection filter={filter} setFilter={setFilter} onDateChange={onDateChange} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Events"
          value={kpiData.events.value}
          icon="fa-chart-line"
          subtitle="Total number of events"
          onClick={() => handleKpiClick('events')}
        />
        <KPICard
          title="Entities"
          value={kpiData.entities.value}
          icon="fa-database"
          subtitle="Total number of entities"
          onClick={() => handleKpiClick('entities')}
        />
        <KPICard
          title="Initialized"
          value={kpiData.initialized.value}
          icon="fa-rotate-right"
          subtitle="Percentage of initialized entities"
          onClick={() => handleKpiClick('initialized')}
        />        
        <KPICard
          title="Outliers"
          value={kpiData.outliers.value}
          icon="fa-exclamation-triangle"
          subtitle="Total number of outliers"
          onClick={() => handleKpiClick('outliers')}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Timeline (2/3 width) */}
        <div className="lg:col-span-2">
          <ChartCard 
            title="Events per Hour" 
            subtitle="Activity patterns over time"
            fullscreen={true}
            onExport={(format) => handleChartExport('events-per-hour', format)}
          >
            <EventsPerHourChart
              data={eventsPerHourHook.data}
              loading={eventsPerHourHook.loading}
              error={eventsPerHourHook.error}
              height={300}
              bottom={0}
            />
          </ChartCard>
        </div>

        {/* Agent Health (1/3 width) */}
        <div>
          <ChartCard 
            title="Agent Health" 
            subtitle="Active vs Inactive"
            onExport={(format) => handleChartExport('agent-health', format)}
          >
            <AgentHealthChart
              data={agentHealthHook.data ? { active24h: agentHealthHook.data.active24h, inactive24h: agentHealthHook.data.inactive24h } : null}
              loading={agentHealthHook.loading}
              error={agentHealthHook.error}
              onSegmentClick={(status, count) => console.log(`${status}: ${count} agents`)}
            />
          </ChartCard>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <div className='space-y-6'> */}
          <ChartCard 
            title="Activity Heatmap" 
            subtitle="Weekdays × Hours distribution"
            fullscreen={true}
            onExport={(format) => handleChartExport('heatmap', format)}
          >
            <HeatmapChart
              data={heatmapHook.data}
              loading={heatmapHook.loading}
              error={heatmapHook.error}
            />
          </ChartCard>

          <ChartCard 
            title="Top Processes" 
            subtitle="Most active processes"
            onExport={(format) => handleChartExport('top-processes', format)}
          >
            <TopProcessesChart
              data={topProcessesHook.data}
              loading={topProcessesHook.loading}
              error={topProcessesHook.error}
              onBarClick={handleBarClick}
            />
          </ChartCard>

           <ChartCard 
            title="Top Keys" 
            subtitle="Most active processes"
            onExport={(format) => handleChartExport('top-processes', format)}
          >
            <TopKeysChart
               data={topKeysHook.data}
              loading={topKeysHook.loading}
              error={topKeysHook.error}
              onBarClick={handleBarClick}
              />
          </ChartCard>
        {/* </div> */}
        
        {/* <div className="space-y-6"> */}
          
          <ChartCard 
            title="Top Users" 
            subtitle="Most active users"
            onExport={(format) => handleChartExport('top-users', format)}
          >
            <TopUsersChart
              data={topUsersHook.data}
              loading={topUsersHook.loading}
              error={topUsersHook.error}
              onBarClick={handleBarClick}
            />
          </ChartCard>
        {/* </div> */}
      </div>
      {/* Modal for bar info */}
      <InfoModal open={!!modalInfo} onClose={() => setModalInfo(null)} info={modalInfo} />
    </div>
  );
}

