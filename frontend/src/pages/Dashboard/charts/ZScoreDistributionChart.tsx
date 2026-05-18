import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { ChartContainer, BaseChartProps } from './BaseChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface ZDistributionData {
  z_Bin: number;
  [key: string]: number; // Allow dynamic metric keys
}

interface ZScoreDistributionChartProps extends BaseChartProps {
  data: ZDistributionData[] | null;
  onDataPointClick?: (data: { zBin: number; metric: string; count: number }) => void;
}

export function ZScoreDistributionChart({ 
  data, 
  loading, 
  error, 
  height = 300,
  onDataPointClick 
}: ZScoreDistributionChartProps) {
  const chartData: ChartData<'bar'> | null = data ? (() => {
    // Dynamically get all unique metric keys (excluding z_Bin) across the dataset
    const allMetricKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).filter(key => key !== 'z_Bin').forEach(key => allMetricKeys.add(key));
    });
    const metricKeys = Array.from(allMetricKeys);
    
    // Predefined colors (expand as needed for more metrics)
    const colors = [
      { bg: 'rgba(79, 70, 229, 0.8)', border: 'rgba(79, 70, 229, 1)' },
      { bg: 'rgba(251, 191, 36, 0.8)', border: 'rgba(251, 191, 36, 1)' },
      { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)' },
      { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' }, // Example for metric3
      { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)' }, // Example for metric4
    ];
    
    return {
      labels: data.map(item => item.z_Bin?.toFixed(1)),
      datasets: metricKeys.map((metric, index) => ({
        label: `Metric ${metric.replace('metric', '')}`, // e.g., "Metric 0"
        data: data.map(item => item[metric] || 0),
        backgroundColor: colors[index % colors.length].bg,
        borderColor: colors[index % colors.length].border,
        borderWidth: 1,
      }))
    };
  })() : null;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          title: (context) => `Z-Score Range: ${context[0].label}`,
          label: (context) => {
            const metric = context.dataset.label;
            const count = context.parsed.y;
            return `${metric}: ${count} alerts`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Z-Score Bins'
        },
        grid: {
          display: false
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
        const allMetricKeys = new Set<string>();
        data.forEach(item => {
          Object.keys(item).filter(key => key !== 'z_Bin').forEach(key => allMetricKeys.add(key));
        });
        const metricKeys = Array.from(allMetricKeys);
        const metric = metricKeys[datasetIndex];
        const zBin = data[dataIndex].z_Bin;
        const count = data[dataIndex][metric] || 0;
        
        onDataPointClick({ zBin, metric, count });
      }
    }
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      {chartData && <Bar data={chartData} options={options} />}
    </ChartContainer>
  );
}