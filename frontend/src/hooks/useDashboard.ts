import { useState, useEffect } from 'react';
import { AlertAgeResponse,
     AlertSeverityTimelineResponse, 
     BacklogStatusResponse, DashboardKPIs, TopKeysResponse,
      ZDistributionResponse, AgentHealthResponse, dashboardApi } from '../services/dashboardApi';

import { endpoints } from '../services/api';

export function useDashboardKPIs(from?: string, to?: string) {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await endpoints.dashboardKpis(from, to);
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to]);

  return { data, loading, error };
}

export function useAlertSeverityTimeline(from: string, to: string, agentId?: string, metric?: number) {
  const [data, setData] = useState<AlertSeverityTimelineResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await dashboardApi.getAlertSeverityTimeline(from, to, agentId, metric);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alert timeline');
      } finally {
        setLoading(false);
      }
    };

    if (from && to) {
      fetchData();
    }
  }, [from, to, agentId, metric]);

  return { data, loading, error };
}

export function useEventsPerHour(from?: string, to?: string) {
  const [data, setData] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await endpoints.eventsByHour(from, to);
        const hourlyData = new Array(24).fill(0);
        response.data.forEach((item: number, index: number) => {
          hourlyData[index] = item;
        });
        setData(hourlyData);        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to]);

  return { data, loading, error };
}

export function useHeatmapData(from?: string, to?: string) {
  const [data, setData] = useState<number[][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = from && to 
          ? await endpoints.heatmap(from, to)
          : { data: Array.from({ length: 7 }, () => new Array(24).fill(0)) }; // Default empty heatmap
        let heatmapData: number[][];
        // Check if data is an array of 7 arrays, each with 24 numbers
        if (Array.isArray(result.data) && result.data.length === 7 && result.data.every(day => Array.isArray(day) && day.length === 24 && day.every(hour => typeof hour === 'number'))) {
          heatmapData = result.data as number[][];
        } else {
          heatmapData = Array.from({ length: 7 }, () => new Array(24).fill(0));
        }
        setData(heatmapData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load heatmap data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to]);

  return { data, loading, error };
}

export function useTopItems(type: 'processes' | 'users' | 'keys', from?: string, to?: string, limit?: number) {
  const [data, setData] = useState<{ hostname:string, name: string; count: number }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await endpoints.topItems(type, from, to, limit);
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to load top ${type}`);
      } finally {
        setLoading(false);
      }
    };

    if (from && to) {
      fetchData();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [type, from, to, limit]);

  return { data, loading, error };
}

export function useAgentHealth(from?: string, to?: string,) {
  const [data, setData] = useState<AgentHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await dashboardApi.getAgentHealth(from, to);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent health');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to]);

  return { data, loading, error };
}

// Export utilities
export function formatChartData<T>(
  rawData: T[] | null,
  transform: (data: T[]) => any
): any | null {
  if (!rawData || !Array.isArray(rawData)) return null;
  return transform(rawData);
}

export function transformSeverityTimeline(data: AlertSeverityTimelineResponse[]) {
  // Group by timestamp and pivot by severity
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.bucket]) {
      acc[item.bucket] = { timestamp: item.bucket, critical: 0, high: 0, medium: 0, low: 0 };
    }
    acc[item.bucket][item.severity.toLowerCase() as keyof typeof acc[typeof item.bucket]] = item.alerts;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped);
}

export function transformZDistribution(data: ZDistributionResponse[]) {
  // Group by z_bin and pivot by metric
  const grouped = data.reduce((acc, item) => {
    const binKey = item.z_Bin.toString();
    if (!acc[binKey]) {
      acc[binKey] = { zBin: item.z_Bin, metric0: 0, metric3: 0, metric5: 0, metric7: 0 };
    }
    acc[binKey][`metric${item.metric}` as keyof typeof acc[typeof binKey]] = item.cnt;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).sort((a, b) => a.zBin - b.zBin);
}

export function transformBacklogStatus(data: BacklogStatusResponse) {
  return {
    open: data.openAlerts,
    whitelisted: data.whitelistedAlerts,
    muted: data.mutedAlerts
  };
}

export function transformAlertAge(data: AlertAgeResponse[]) {
  return data.map(item => ({
    ageBin: `${item.ageHoursBin}-${item.ageHoursBin + 6}h`,
    count: item.count
  })).sort((a, b) => parseInt(a.ageBin) - parseInt(b.ageBin));
}

export function transformTopKeys(data: TopKeysResponse[]) {
  return data.map(item => ({
    key: item.key,
    zLoad: item.zLoad,
    alerts: item.alertCount
  }));
}

// Chart color schemes
export const CHART_COLORS = {
  severity: {
    critical: '#dc2626',
    high: '#ea580c', 
    medium: '#d97706',
    low: '#0891b2'
  },
  metrics: {
    metric0: '#4f46e5',
    metric3: '#22c55e',
    metric5: '#f59e0b',
    metric7: '#ef4444'
  },
  status: {
    open: '#dc2626',
    whitelisted: '#059669',
    muted: '#6b7280',
    active: '#22c55e',
    inactive: '#ef4444'
  },
  gradient: [
    '#e3f2fd',
    '#bbdefb', 
    '#90caf9',
    '#64b5f6',
    '#42a5f5',
    '#2196f3',
    '#1e88e5',
    '#1976d2'
  ]
};

// Utility functions for data processing
export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return '+0.0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function formatDateTime(isoString: string, timezone: 'UTC' | 'Europe/Zurich' = 'UTC'): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone === 'UTC' ? 'UTC' : 'Europe/Zurich'
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}