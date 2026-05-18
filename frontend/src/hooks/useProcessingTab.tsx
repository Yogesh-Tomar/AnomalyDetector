import { useState, useEffect } from 'react';
import { dashboardApi, DashboardKPIs, FirstSeenKeysResponse, FunnelResponse, SequenceResponse } from '../services/dashboardApi';

export function useProcessingTab(from?: string, to?: string) {
  // Processing Funnel
  const [processingFunnelData, setProcessingFunnelData] = useState<{ eventsCount: number; statsRecordCount: number; alertsCount: number } | null>(null);
  const [processingFunnelLoading, setProcessingFunnelLoading] = useState(true);
  const [processingFunnelError, setProcessingFunnelError] = useState<string | null>(null);

  // First Seen Keys
  const [firstSeenKeysData, setFirstSeenKeysData] = useState<{ date: string; count: number }[] | null>(null);
  const [firstSeenKeysLoading, setFirstSeenKeysLoading] = useState(true);
  const [firstSeenKeysError, setFirstSeenKeysError] = useState<string | null>(null);

  

  // Sequence Data
  const [sequenceData, setSequenceData] = useState<{ agentId: string; hostname: string; processImagePath: string; processTimestamp: string; destinationIp: string; destinationPort: string; networkTimestamp: string; targetFilename: string; fileTimestamp: string }[] | null>(null);
  const [sequenceLoading, setSequenceLoading] = useState(true);
  const [sequenceError, setSequenceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Processing Funnel (using KPIs)
      try {
        setProcessingFunnelLoading(true);
        setProcessingFunnelError(null);
        const processingFunnel: FunnelResponse = await dashboardApi.getProcessingFunnel(from, to);
        setProcessingFunnelData({
          eventsCount: processingFunnel.eventsCount,
          statsRecordCount: processingFunnel.statsRecordCount,
          alertsCount: processingFunnel.alertsVisibleCount
        });
      } catch (err) {
        setProcessingFunnelError(err instanceof Error ? err.message : 'Failed to load processing funnel');
      } finally {
        setProcessingFunnelLoading(false);
      }

      // Fetch First Seen Keys
      try {
        setFirstSeenKeysLoading(true);
        setFirstSeenKeysError(null);
        const keys: FirstSeenKeysResponse[] = await dashboardApi.getFirstSeenKeys(from || '', to || '', 50); // Default top 50
        // Aggregate by date
        const aggregated = keys.reduce((acc, item) => {
          const date = item.firstSeenUtc.split('T')[0]; // Extract date part
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setFirstSeenKeysData(Object.entries(aggregated).map(([date, count]) => ({ date, count })));
      } catch (err) {
        setFirstSeenKeysError(err instanceof Error ? err.message : 'Failed to load first seen keys');
      } finally {
        setFirstSeenKeysLoading(false);
      }

      // Fetch Sequence Data
      try {
        setSequenceLoading(true);
        setSequenceError(null);
        const sequences: SequenceResponse[] = await dashboardApi.getSequenceData(from || '', to || '', 60, 100); // Default winMinutes 60, top 100
        setSequenceData(sequences.map(seq => ({
          agentId: seq.agentId,
          hostname: seq.hostname,
          processImagePath: seq.processImagePath,
          processTimestamp: seq.processTimestamp,
          destinationIp: seq.destinationIp,
          destinationPort: seq.destinationPort,
          networkTimestamp: seq.networkTimestamp,
          targetFilename: seq.targetFilename,
          fileTimestamp: seq.fileTimestamp
        })));
      } catch (err) {
        setSequenceError(err instanceof Error ? err.message : 'Failed to load sequence data');
      } finally {
        setSequenceLoading(false);
      }
    };

    if (from && to) {
      fetchData();
    } else {
      // Set defaults if no dates
      setProcessingFunnelData(null);
      setFirstSeenKeysData([]);      
      setSequenceData([]);
      setProcessingFunnelLoading(false);
      setFirstSeenKeysLoading(false);      
      setSequenceLoading(false);
    }
  }, [from, to]);

  return {
    processingFunnel: { data: processingFunnelData, loading: processingFunnelLoading, error: processingFunnelError },
    firstSeenKeys: { data: firstSeenKeysData, loading: firstSeenKeysLoading, error: firstSeenKeysError },
    sequenceData: { data: sequenceData, loading: sequenceLoading, error: sequenceError }
  };
}