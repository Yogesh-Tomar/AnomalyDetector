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

export interface AlertAgeData {
  ageBin: string;
  count: number;
}

interface AlertAgeHistogramChartProps extends BaseChartProps {
  data: AlertAgeData[] | null;
  onBarClick?: (ageBin: string, count: number) => void;
}

export function AlertAgeHistogramChart({ 
  data, 
  loading, 
  error, 
  height = 300,
  onBarClick 
}: AlertAgeHistogramChartProps) {
  const getBarColor = (ageBin: string) => {
    // Color gradient from green (recent) to red (old)
    const ageHours = parseInt(ageBin.split('-')[0]);
    if (ageHours < 6) return 'rgba(34, 197, 94, 0.8)'; // Green
    if (ageHours < 12) return 'rgba(251, 191, 36, 0.8)'; // Yellow
    if (ageHours < 24) return 'rgba(249, 115, 22, 0.8)'; // Orange
    return 'rgba(239, 68, 68, 0.8)'; // Red
  };

  const chartData: ChartData<'bar'> | null = data ? {
    labels: data.map(item => item.ageBin),
    datasets: [
      {
        label: 'Open Alerts',
        data: data.map(item => item.count),
        backgroundColor: data.map(item => getBarColor(item.ageBin)),
        borderColor: data.map(item => getBarColor(item.ageBin).replace('0.8', '1')),
        borderWidth: 1,
      }
    ]
  } : null;

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y', // Horizontal bar chart
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
          title: (context) => `Age Range: ${context[0].label}`,
          label: (context) => `${context.parsed.x} open alerts`
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Number of Alerts'
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Alert Age'
        },
        grid: {
          display: false
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick && data) {
        const dataIndex = elements[0].index;
        const ageBin = data[dataIndex].ageBin;
        const count = data[dataIndex].count;
        
        onBarClick(ageBin, count);
      }
    }
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      {chartData && <Bar data={chartData} options={options} />}
    </ChartContainer>
  );
}