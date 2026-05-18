import { useState, useEffect } from 'react';
import { NoiseResponse, dashboardApi } from '../services/dashboardApi';

export function useOperationsTab(from?: string, to?: string) {
  // Top Noisy Agents
  const [topAgentsData, setTopAgentsData] = useState<NoiseResponse[] | null>(null);
  const [topAgentsLoading, setTopAgentsLoading] = useState(true);
  const [topAgentsError, setTopAgentsError] = useState<string | null>(null);

  // Top Noisy Users
  const [topUsersData, setTopUsersData] = useState<NoiseResponse[] | null>(null);
  const [topUsersLoading, setTopUsersLoading] = useState(true);
  const [topUsersError, setTopUsersError] = useState<string | null>(null);

  // Top Noisy Processes
  const [topProcessesData, setTopProcessesData] = useState<NoiseResponse[] | null>(null);
  const [topProcessesLoading, setTopProcessesLoading] = useState(true);
  const [topProcessesError, setTopProcessesError] = useState<string | null>(null);

  // Suppression Trend
  const [suppressionTrendData, setSuppressionTrendData] = useState<{ d: string; whitelisted: number; muted: number; actionable: number }[] | null>(null);
  const [suppressionTrendLoading, setSuppressionTrendLoading] = useState(true);
  const [suppressionTrendError, setSuppressionTrendError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Top Noisy Agents
      try {
        setTopAgentsLoading(true);
        setTopAgentsError(null);
        const agents = await dashboardApi.getTopNoisyAgents(from || '', to || '', 10); // Default top 10
        setTopAgentsData(agents);
      } catch (err) {
        setTopAgentsError(err instanceof Error ? err.message : 'Failed to load top agents');
      } finally {
        setTopAgentsLoading(false);
      }

      // Fetch Top Noisy Users
      try {
        setTopUsersLoading(true);
        setTopUsersError(null);
        const users = await dashboardApi.getTopNoisyUsers(from || '', to || '', 10);
        setTopUsersData(users);
      } catch (err) {
        setTopUsersError(err instanceof Error ? err.message : 'Failed to load top users');
      } finally {
        setTopUsersLoading(false);
      }

      // Fetch Top Noisy Processes
      try {
        setTopProcessesLoading(true);
        setTopProcessesError(null);
        const processes = await dashboardApi.getTopNoisyProcesses(from || '', to || '', 10);
        setTopProcessesData(processes);
      } catch (err) {
        setTopProcessesError(err instanceof Error ? err.message : 'Failed to load top processes');
      } finally {
        setTopProcessesLoading(false);
      }

      // Fetch Suppression Trend
      try {
        setSuppressionTrendLoading(true);
        setSuppressionTrendError(null);
        const trend = await dashboardApi.getSuppressionTrend(from || '', to || '');
        setSuppressionTrendData(trend);
      } catch (err) {
        setSuppressionTrendError(err instanceof Error ? err.message : 'Failed to load suppression trend');
      } finally {
        setSuppressionTrendLoading(false);
      }
    };

    if (from && to) {
      fetchData();
    } else {
      // If no dates, set defaults or handle accordingly
      setTopAgentsData([]);
      setTopUsersData([]);
      setTopProcessesData([]);
      setSuppressionTrendData([]);
      setTopAgentsLoading(false);
      setTopUsersLoading(false);
      setTopProcessesLoading(false);
      setSuppressionTrendLoading(false);
    }
  }, [from, to]);

  return {
    topAgents: { data: topAgentsData, loading: topAgentsLoading, error: topAgentsError },
    topUsers: { data: topUsersData, loading: topUsersLoading, error: topUsersError },
    topProcesses: { data: topProcessesData, loading: topProcessesLoading, error: topProcessesError },
    suppressionTrend: { data: suppressionTrendData, loading: suppressionTrendLoading, error: suppressionTrendError }
  };
}