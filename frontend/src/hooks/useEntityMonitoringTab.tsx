import { useState, useEffect } from 'react';
import { EntityDriftResponse, dashboardApi } from '../services/dashboardApi';

export function useEntityMonitoringTab(from?: string, to?: string) {
  
  // Duplicate Rate
  const [duplicateRateData, setDuplicateRateData] = useState<{ date: string; totalRows: number; uniqueEvents: number; duplicateRate: number }[] | null>(null);
  const [duplicateRateLoading, setDuplicateRateLoading] = useState(true);
  const [duplicateRateError, setDuplicateRateError] = useState<string | null>(null);
  
  // Drift Trend
  const [driftTrendData, setDriftTrendData] = useState<EntityDriftResponse[] | null>(null);
  const [driftTrendLoading, setDriftTrendLoading] = useState(true);
  const [driftTrendError, setDriftTrendError] = useState<string | null>(null);

  // Initialization Coverage
  const [initCoverageData, setInitCoverageData] = useState<{ agentId: string; percentInitialized: number; totalEntities: number }[] | null>(null);
  const [initCoverageLoading, setInitCoverageLoading] = useState(true);
  const [initCoverageError, setInitCoverageError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {

      // Fetch Duplicate Rate
      try {
        setDuplicateRateLoading(true);
        setDuplicateRateError(null);
        const rate = await dashboardApi.getDuplicateRate(from || '', to || '');
        setDuplicateRateData(rate);
      } catch (err) {
        setDuplicateRateError(err instanceof Error ? err.message : 'Failed to load duplicate rate');
      } finally {
        setDuplicateRateLoading(false);
      }

      // Fetch Drift Trend
      try {
        setDriftTrendLoading(true);
        setDriftTrendError(null);
        const drift = await dashboardApi.getEntityDrift(from || '', to || '');
        setDriftTrendData(drift);
      } catch (err) {
        setDriftTrendError(err instanceof Error ? err.message : 'Failed to load drift trend');
      } finally {
        setDriftTrendLoading(false);
      }

      // Fetch Initialization Coverage (no date dependency)
      try {
        setInitCoverageLoading(true);
        setInitCoverageError(null);
        const coverage = await dashboardApi.getInitCoverage();
        setInitCoverageData(coverage);
      } catch (err) {
        setInitCoverageError(err instanceof Error ? err.message : 'Failed to load initialization coverage');
      } finally {
        setInitCoverageLoading(false);
      }
    };

    if (from && to) {
      fetchData();
    } else {
      // If no dates for drift trend, set empty array; init coverage can still load
      setDriftTrendData([]);
      setDriftTrendLoading(false);
      // Fetch init coverage regardless
      dashboardApi.getInitCoverage()
        .then(setInitCoverageData)
        .catch(err => setInitCoverageError(err instanceof Error ? err.message : 'Failed to load initialization coverage'))
        .finally(() => setInitCoverageLoading(false));
    }
  }, [from, to]);

  return {
    duplicateRate: { data: duplicateRateData, loading: duplicateRateLoading, error: duplicateRateError },
    driftTrend: { data: driftTrendData, loading: driftTrendLoading, error: driftTrendError },
    initCoverage: { data: initCoverageData, loading: initCoverageLoading, error: initCoverageError }
  };
}