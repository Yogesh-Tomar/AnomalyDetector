import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { ChartContainer, BaseChartProps } from './BaseChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface AlertSeverityData {
  timestamp: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface AlertSeverityTimelineChartProps extends BaseChartProps {
  data: AlertSeverityData[] | null;
  onDataPointClick?: (data: { timestamp: string; severity: string; count: number }) => void;
}

export function AlertSeverityTimelineChart({ 
  data, 
  loading, 
  error, 
  height = 300,
  onDataPointClick 
}: AlertSeverityTimelineChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData: ChartData<'line'> | null = data ? {
    labels: data.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Critical',
        data: data.map(item => item.critical),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'High',
        data: data.map(item => item.high),
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Medium',
        data: data.map(item => item.medium),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Low',
        data: data.map(item => item.low),
        borderColor: '#0891b2',
        backgroundColor: 'rgba(8, 145, 178, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      }
    ]
  } : null;

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: (context) => {
            const dataIndex = context[0].dataIndex;
            return data ? `Time: ${data[dataIndex].timestamp}` : '';
          },
          label: (context) => {
            const severity = context.dataset.label;
            const count = context.parsed.y;
            return `${severity}: ${count} alerts`;
          },
          afterBody: (context) => {
            const dataIndex = context[0].dataIndex;
            if (data) {
              const total = data[dataIndex].critical + data[dataIndex].high + 
                           data[dataIndex].medium + data[dataIndex].low;
              return `Total: ${total} alerts`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period'
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Alert Count'
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onDataPointClick && data) {
        const dataIndex = elements[0].index;
        const datasetIndex = elements[0].datasetIndex;
        const severities = ['critical', 'high', 'medium', 'low'];
        const severity = severities[datasetIndex];
        const timestamp = data[dataIndex].timestamp;
        const count = data[dataIndex][severity as keyof AlertSeverityData] as number;
        
        onDataPointClick({ timestamp, severity, count });
      }
    }
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      {chartData && <Line ref={chartRef} data={chartData} options={options} />}
    </ChartContainer>
  );
}