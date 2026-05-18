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
import { hostname } from 'os';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface NoiseData {
  name: string;
  alerts: number;
  hostname: string;
}

interface NoiseAnalysisChartProps extends BaseChartProps {
  data: NoiseData[] | null;
  title: string;
  onBarClick?: (name: string, count: number, hostname: string) => void;
}

export function NoiseAnalysisChart({ 
  data, 
  loading, 
  error, 
  height = 300,
  title,
  onBarClick 
}: NoiseAnalysisChartProps) {
  const chartData: ChartData<'bar'> | null = data ? {
    labels: data.map(item => `${item.hostname} ${item.name != item.hostname ? `(${item.name})` : ''}`),
    datasets: [
      {
        label: 'Alerts',
        data: data.map(item => item.alerts),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ]
  } : null;

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
        // text: title,
        // font: {
        //   size: 14,
        //   weight: 'bold'
        // }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => `${context.parsed.x} alerts`
        }
      }
    },
    scales: {
      x: {
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
      },
      y: {
        display: false,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick && data) {
        const dataIndex = elements[0].index;
        const name = data[dataIndex].name;
        const count = data[dataIndex].alerts;
        const hostname = data[dataIndex].hostname;
        onBarClick(name, count, hostname);
      }
    }
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      {chartData && <Bar data={chartData} options={options} />}
    </ChartContainer>
  );
}
