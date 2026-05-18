import React, { useState, useCallback } from 'react';
import { ChartCard } from '../charts/ChartCard';
import { AlertSeverityTimelineChart } from '../charts/AlertSeverityTimelineChart';
import { AlertAgeHistogramChart } from '../charts/AlertAgeHistogramChart';
import { BacklogStatusChart } from '../charts/BacklogStatusChart';
import { ZScoreDistributionChart } from '../charts/ZScoreDistributionChart';
import { TopKeysTable } from '../charts/TopKeysTable';
import { DateFilterSection } from '../components/DateFilterSection';
import { 
  useAlertSeverityTimeline, 
  useAlertAgeHistogram, 
  useBacklogStatus, 
  useTopKeysByZLoad, 
  useZScoreDistribution
} from '../../../hooks/useAlertAnalytics';

interface AlertAnalyticsTabProps {
  filter: string;
  setFilter: (filter: string) => void;
  customFrom: string;
  setCustomFrom: (from: string) => void;
  customTo: string;
  setCustomTo: (to: string) => void;
}

export default function AlertAnalyticsTab({ filter, setFilter, customFrom, setCustomFrom, customTo, setCustomTo }: AlertAnalyticsTabProps) {
  // Date filter state
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const onDateChange = useCallback((range: { from: string; to: string } | null) => {
    setDateRange(range);
  }, []);

  // API hooks (fetch data based on dateRange)
  const { data: severityTimeline, loading: loadingSeverity, error: errorSeverity } =
    useAlertSeverityTimeline(dateRange?.from, dateRange?.to);
  const { data: zScoreDistribution, loading: loadingZScore, error: errorZScore } =
    useZScoreDistribution(dateRange?.from, dateRange?.to);  
  const { data: backlogStatus, loading: loadingBacklog, error: errorBacklog } =
    useBacklogStatus(dateRange?.from, dateRange?.to);
  const { data: alertAge, loading: loadingAlertAge, error: errorAlertAge } =
    useAlertAgeHistogram(dateRange?.from, dateRange?.to);
  const { data: topKeys, loading: loadingTopKeys, error: errorTopKeys } =
    useTopKeysByZLoad(dateRange?.from, dateRange?.to);

  const handleSeverityClick = (data: { timestamp: string; severity: string; count: number }) => {
    // Navigate to alerts page with filters
    console.log('Navigate to alerts:', data);
  };

  const handleBacklogClick = (status: string, count: number) => {
    // Filter alerts by status
    console.log(`Filter alerts by ${status}: ${count}`);
  };

  // --- Data transformations for charts ---
  // 1. AlertSeverityTimelineChart expects: { timestamp, critical, high, medium, low }
  const severityMap = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
  } as const;

  const severityTimelineData = severityTimeline
    ? Object.values(
        severityTimeline.reduce((acc, cur) => {
          if (!acc[cur.bucket]) {
            acc[cur.bucket] = {
              timestamp: cur.bucket,
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
            };
          }
          const sev = cur.severity.toLowerCase() as keyof typeof severityMap;
          if (sev in severityMap) {
            acc[cur.bucket][severityMap[sev]] = cur.alerts;
          }
          return acc;
        }, {} as Record<string, { timestamp: string; critical: number; high: number; medium: number; low: number }>)
      )
    : null;

  // 2. BacklogStatusChart expects: { open, whitelisted, muted } as numbers (not string)
  const backlogStatusData = backlogStatus
    ? {
        open: backlogStatus.openAlerts,
        whitelisted: backlogStatus.whitelistedAlerts,
        muted: backlogStatus.mutedAlerts,
      }
    : null;

  // 3. ZScoreDistributionChart expects: { zBin, [dynamic metric keys]: number }
  const zScoreDistributionData = zScoreDistribution
    ? (() => {
        // Group by zBin, then assign metric values dynamically
        const grouped: Record<number, { z_Bin: number; [key: string]: number }> = {};
        const allMetrics = new Set<string>();
        zScoreDistribution.forEach(item => {
          if (!grouped[item.z_Bin]) {
            grouped[item.z_Bin] = { z_Bin: item.z_Bin };
          }
          const metricKey = `metric${item.metric}`;
          grouped[item.z_Bin][metricKey] = item.cnt;
          allMetrics.add(metricKey);
        });
        // Ensure all metrics are present in each grouped item (default to 0)
        Object.values(grouped).forEach(item => {
          allMetrics.forEach(metric => {
            if (!(metric in item)) item[metric] = 0;
          });
        });
        return Object.values(grouped);
      })()
    : null;

  // 4. AlertAgeHistogramChart expects: { ageBin, count } with ageBin as string
  const alertAgeData = alertAge
    ? alertAge.map(item => ({
        ageBin: String(item.ageHoursBin),
        count: item.count,
      }))
    : null;

  // 5. TopKeysTable already mapped below

  // Example filter options; adjust as needed
  const filterOptions = [
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last24hours', label: 'Last 24 Hours' },
  ];

  return (
    <div className="space-y-6">
      <DateFilterSection filter={filter} setFilter={setFilter} onDateChange={onDateChange} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />

      {/* Alert Timeline and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Alert Severity Timeline" 
            subtitle="Severity distribution over time"
            fullscreen={true}
            onExport={(format) => console.log(`Export severity timeline as ${format}`)}
          >
            <AlertSeverityTimelineChart
              data={severityTimelineData}
              loading={loadingSeverity}
              error={errorSeverity}
              onDataPointClick={handleSeverityClick}
            />
          </ChartCard>
        </div>
        <div>
          <ChartCard 
            title="Alert Backlog Status" 
            subtitle="Current alert distribution"
            onExport={(format) => console.log(`Export backlog status as ${format}`)}
          >
            <BacklogStatusChart
              data={backlogStatusData}
              loading={loadingBacklog}
              error={errorBacklog}
              onSegmentClick={handleBacklogClick}
          />
          </ChartCard>
        </div>
      </div>

      {/* Z-Score Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Z-Score Distribution" 
          subtitle="Anomaly score distribution by metric"
          fullscreen={true}
          onExport={(format) => console.log(`Export z-score distribution as ${format}`)}
        >
          <ZScoreDistributionChart
            data={zScoreDistributionData}
            loading={loadingZScore}
            error={errorZScore}
            onDataPointClick={(data) => console.log('Z-score clicked:', data)}
          />
        </ChartCard>
        
        <ChartCard 
          title="Alert Age Distribution in hours" 
          subtitle="Time since alert generation"
          onExport={(format) => console.log(`Export alert age as ${format}`)}
        >
          <AlertAgeHistogramChart
            data={alertAgeData}
            loading={loadingAlertAge}
            error={errorAlertAge}
            onBarClick={(ageBin, count) => console.log(`Age ${ageBin}: ${count} alerts`)}
          />
        </ChartCard>
      </div>

      {/* Top Keys Analysis */}
      <ChartCard 
        title="Top Keys by Z-Load" 
        subtitle="Keys with highest cumulative anomaly scores"
        onExport={(format) => console.log(`Export top keys as ${format}`)}
      >
        <TopKeysTable
          data={
            topKeys
              ? topKeys.map(({ key, zLoad, alertCount }) => ({
                  key,
                  zLoad,
                  alertCount,
                }))
              : null
          }
          loading={loadingTopKeys}
          error={errorTopKeys}
          onRowClick={(key) => console.log(`Navigate to key details: ${key}`)}
        />
      </ChartCard>
    </div>
  );
}