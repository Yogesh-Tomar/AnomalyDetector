export interface DashboardKPIs {
  totalEvents: number;
  totalEntities: number;
  initializedCount: number;
  initializedPercentage: number;
  outliers: number;
  activeAgents: number;
  criticalAlerts: number;
}

export interface AlertSeverityTimelineResponse {
  bucket: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  alerts: number;
}

export interface ZDistributionResponse {
  metric: number;
  z_Bin: number;
  cnt: number;
}

export interface BacklogStatusResponse {
  openAlerts: number;
  whitelistedAlerts: number;
  mutedAlerts: number;
}

export interface AlertAgeResponse {
  ageHoursBin: number;
  count: number;
}

export interface TopKeysResponse {
  key: string;
  zLoad: number;
  alertCount: number;
}

export interface FirstSeenKeysResponse {
  key: string;
  agentId: string;
  firstSeenUtc: string;
}

export interface EntityDriftResponse {
  d: string;
  entities_drifted: number;
}

export interface AgentHealthResponse {
  active24h: number;
  inactive24h: number;
}

export interface NoiseResponse {
  name: string;
  alerts: number;
  hostname: string;
}

export interface FunnelResponse {
  eventsCount: number;
  statsRecordCount: number;
  alertsVisibleCount: number;
}

export interface HeatmapResponse {
  weekday_name: string;
  weekday_num: number;
  hour: number;
  metric: number;
  cnt: number;
}

export interface SequenceResponse {
  agentId: string;
  hostname: string;
  processImagePath: string;
  processTimestamp: string;
  destinationIp: string;
  destinationPort: string;
  networkTimestamp: string;
  targetFilename: string;
  fileTimestamp: string;
}

class DashboardAPI {
  private baseUrl: string;

  constructor(baseUrl: string = (import.meta.env.VITE_API_BASE_URL || '') + 'api/DashboardNew/') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  }

  // Helper method for API calls
  private async apiCall<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    
    const token = localStorage.getItem('jwt');

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if needed
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard KPIs
  async getDashboardKPIs(from?: string, to?: string): Promise<DashboardKPIs> {
    return this.apiCall<DashboardKPIs>('kpis', { from, to });
  }

  // Alert Analytics
  async getAlertSeverityTimeline(from: string, to: string, agentId?: string, metric?: number): Promise<AlertSeverityTimelineResponse[]> {
    return this.apiCall<AlertSeverityTimelineResponse[]>('alerts-by-severity', { from, to, agentId, metric });
  }

  async getZScoreDistribution(from: string, to: string, metric?: number, binStep?: number): Promise<ZDistributionResponse[]> {
    return this.apiCall<ZDistributionResponse[]>('alerts-z-distribution', { from, to, metric, binStep });
  }

  async getBacklogStatus(from?: string, to?: string): Promise<BacklogStatusResponse> {
    console.log('from,to in api call:', from, to);
    return this.apiCall<BacklogStatusResponse>('alerts-backlog-status', { from, to });
  }

  async getAlertAgeHistogram(from?: string, to?: string, binHours?: number): Promise<AlertAgeResponse[]> {
    return this.apiCall<AlertAgeResponse[]>('alerts-open-age-histogram', { from, to, binHours });
  }

  async getTopKeysByZLoad(from: string, to: string, top?: number): Promise<TopKeysResponse[]> {
    return this.apiCall<TopKeysResponse[]>('alerts-top-keys-by-zload', { from, to, top });
  }

  // Event Analytics
  async getEventsPerHour(from?: string, to?: string): Promise<number[]> {
    const response = await this.apiCall<{ hour: number; count: number }[]>('events-per-hour', { from, to });
    const hourlyData = new Array(24).fill(0);
    response.forEach(item => {
      hourlyData[item.hour] = item.count;
    });
    return hourlyData;
  }

  async getFirstSeenKeys(from: string, to: string, top?: number): Promise<FirstSeenKeysResponse[]> {
    return this.apiCall<FirstSeenKeysResponse[]>('events-first-seen-keys', { from, to, top });
  }

  async getDuplicateRate(from: string, to: string): Promise<{ date: string; totalRows: number; uniqueEvents: number; duplicateRate: number }[]> {
    return this.apiCall('events-duplicate-rate', { from, to });
  }

  // Entity Analytics
  async getEntityDrift(from: string, to: string): Promise<EntityDriftResponse[]> {
    return this.apiCall<EntityDriftResponse[]>('entities-drift-daily', { from, to });
  }

  async getInitCoverage(): Promise<{ agentId: string; percentInitialized: number; totalEntities: number }[]> {
    return this.apiCall('entities-init-coverage');
  }

  async eventsByHour(from?: string, to?: string): Promise<number[]> {
    const response = await this.apiCall<{ hour: number; count: number }[]>('events-by-hour', { from, to });
    const hourlyData = new Array(24).fill(0);
    response.forEach(item => {
      hourlyData[item.hour] = item.count;
    });
    return hourlyData;
  }

  // Agent Health
  async getAgentHealth(from?: string, to?: string,): Promise<AgentHealthResponse> {
    return this.apiCall<AgentHealthResponse>('agent-health-report', { from, to });
  }

  // Noise Analysis
  async getTopNoisyAgents(from: string, to: string, top?: number): Promise<NoiseResponse[]> {
    const response = await this.apiCall<{ agentId: string; alertCount: number; hostname: string }[]>('noise-top-agents', { from, to, top });
    return response.map(item => ({ name: item.hostname, alerts: item.alertCount, hostname: item.hostname }));
  }

  async getTopNoisyUsers(from: string, to: string, top?: number): Promise<NoiseResponse[]> {
    const response = await this.apiCall<{ user: string; alertCount: number; hostname: string }[]>('noise-top-users', { from, to, top });
    return response.map(item => ({ name: item.user, alerts: item.alertCount, hostname: item.hostname }));
  }

  async getTopNoisyProcesses(from: string, to: string, top?: number): Promise<NoiseResponse[]> {
    const response = await this.apiCall<{ process: string; alertCount: number; hostname: string }[]>('noise-top-processes', { from, to, top });
    return response.map(item => ({ name: item.process, alerts: item.alertCount, hostname: item.hostname }));
  }

  // Advanced Analytics
  async getHeatmapData(from: string, to: string): Promise<number[][]> {
    const response = await this.apiCall<HeatmapResponse[]>('alerts-heatmap', { from, to });
    const heatmap = Array.from({ length: 7 }, () => new Array(24).fill(0));
    response.forEach(item => {
      const dayIndex = item.weekday_num - 1;
      heatmap[dayIndex][item.hour] = item.cnt;
    });
    return heatmap;
  }

  async getSuppressionTrend(from: string, to: string): Promise<{ d: string; whitelisted: number; muted: number; actionable: number }[]> {
    const response = await this.apiCall<{ date: string; whitelisted: number; muted: number; actionable: number }[]>('suppressions-trend', { from, to });
    return response.map(item => ({ d: item.date, whitelisted: item.whitelisted, muted: item.muted, actionable: item.actionable }));
  }

  async getSequenceData(from: string, to: string, winMinutes?: number, top?: number): Promise<SequenceResponse[]> {
    return this.apiCall<SequenceResponse[]>('sequence-proc-net-file', { from, to, winMinutes, top });
  }

  // Top Items (generic endpoint for processes, users, keys)
  async getTopItems(type: 'processes' | 'users' | 'keys', from?: string, to?: string, limit?: number): Promise<{ name: string; count: number }[]> {
    const endpoint = type === 'keys' ? 'alerts/top-keys' : `noise/top-${type}`;
    const response = await this.apiCall<any[]>(endpoint, { from, to, top: limit });
    
    // Normalize response format
    if (type === 'keys') {
      return response.map(item => ({ name: item.key, count: item.alerts }));
    } else {
      return response.map(item => ({ name: item.name, count: item.alerts }));
    }
  }

  async getProcessingFunnel(from?: string, to?: string): Promise<FunnelResponse> {
    return this.apiCall<FunnelResponse>('processing-funnel', { from, to });
  }

}

// Create singleton instance
export const dashboardApi = new DashboardAPI();