import React from 'react';
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
  ChartData,
  ChartOptions
} from 'chart.js';
import { ChartContainer, BaseChartProps } from './BaseChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface FirstSeenKeysData {
  date: string;
  count: number;
}

interface FirstSeenKeysChartProps extends BaseChartProps {
  data: FirstSeenKeysData[] | null;
  onDataPointClick?: (date: string, count: number) => void;
}

export function FirstSeenKeysChart({ 
  data, 
  loading, 
  error, 
  height = 300,
  onDataPointClick 
}: FirstSeenKeysChartProps) {
  const chartData: ChartData<'line'> | null = data ? {
    labels: data.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'New Keys Discovered',
        data: data.map(item => item.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }
    ]
  } : null;

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          title: (context) => `Date: ${context[0].label}`,
          label: (context) => `New Keys: ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
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
          text: 'Keys Discovered'
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
        const date = data[dataIndex].date;
        const count = data[dataIndex].count;
        onDataPointClick(date, count);
      }
    }
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      {chartData && <Line data={chartData} options={options} />}
    </ChartContainer>
  );
}