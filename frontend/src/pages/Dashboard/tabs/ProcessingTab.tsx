import React, { useState, useCallback } from 'react';
import { ChartCard } from '../charts/ChartCard';
import { ProcessingFunnelChart } from '../charts/ProcessingFunnelChart';
import { FirstSeenKeysChart } from '../charts/FirstSeenKeysChart';
import { ProcessSequenceTable } from '../charts/ProcessSequenceTable';
import { DateFilterSection } from '../components/DateFilterSection';
import { useProcessingTab } from '../../../hooks/useProcessingTab';

interface ProcessingTabProps {
  filter: string;
  setFilter: (filter: string) => void;
  customFrom: string;
  setCustomFrom: (from: string) => void;
  customTo: string;
  setCustomTo: (to: string) => void;
}

export default function ProcessingTab({ filter, setFilter, customFrom, setCustomFrom, customTo, setCustomTo }: ProcessingTabProps) {
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const onDateChange = useCallback((range: { from: string; to: string } | null) => {
    setDateRange(range);
  }, []);

  // Replace local state with hook
  const {
    processingFunnel: { data: processingFunnelData, loading: processingFunnelLoading, error: processingFunnelError },
    firstSeenKeys: { data: firstSeenKeysData, loading: firstSeenKeysLoading, error: firstSeenKeysError },
    sequenceData: { data: sequenceData, loading: sequenceLoading, error: sequenceError }
  } = useProcessingTab(dateRange?.from, dateRange?.to);
  
  return (
    <div className="space-y-6">
      <DateFilterSection filter={filter} setFilter={setFilter} onDateChange={onDateChange} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />
      
      {/* Discovery and Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="New Key Discovery" 
          subtitle="First-seen keys over time"
          onExport={(format) => console.log(`Export first seen keys as ${format}`)}
        >
          <FirstSeenKeysChart
            data={firstSeenKeysData}
            loading={firstSeenKeysLoading}
            error={firstSeenKeysError}
            onDataPointClick={(date: string, count: number) => console.log(`${date}: ${count} new keys`)}
          />
        </ChartCard>
        
        {/* Processing Funnel */}
      <ChartCard 
        title="Processing Funnel" 
        subtitle="Data flow through processing stages"
        onExport={(format) => console.log(`Export funnel as ${format}`)}
      >
        <ProcessingFunnelChart
          data={processingFunnelData}
          loading={processingFunnelLoading}
          error={processingFunnelError}
          onStageClick={(stage: string, count: number) => console.log(`${stage}: ${count}`)}
        />
      </ChartCard>
       
      </div>

      {/* Sequence Analysis */}
      <ChartCard 
        title="Process → Network → File Sequences" 
        subtitle="Behavioral analysis of process chains"
        fullscreen={true}
        onExport={(format) => console.log(`Export sequences as ${format}`)}
      >
        <ProcessSequenceTable
          data={sequenceData}
          loading={sequenceLoading}
          error={sequenceError}
          onRowClick={(sequence: any) => console.log('Sequence details:', sequence)}
        />
      </ChartCard>
    </div>
  );
}

