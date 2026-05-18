import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Plugin
} from 'chart.js';
import { ChartContainer, BaseChartProps } from './BaseChart';

ChartJS.register(ArcElement, Tooltip, Legend);

const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerText',
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const width = chart.width;
    const height = chart.height;

    const text = (chart.options.plugins as any)?.centerText?.text;
    if (!text) return;

    const cutout = chart.options.cutout as string;
    const cutoutPercentage = parseFloat(cutout) / 100;
    const chartAreaWidth = chart.chartArea.right - chart.chartArea.left;
    const chartAreaHeight = chart.chartArea.bottom - chart.chartArea.top;
    const outerRadius = Math.min(chartAreaWidth, chartAreaHeight) / 2;
    const innerRadius = outerRadius * cutoutPercentage;

    const sidePadding = 20;
    const sidePaddingCalculated = (sidePadding / 100) * (innerRadius * 2);

    ctx.font = "30px Arial";

    const stringWidth = ctx.measureText(text).width;
    const elementWidth = innerRadius * 2 - sidePaddingCalculated;

    const widthRatio = elementWidth / stringWidth;
    const newFontSize = Math.floor(30 * widthRatio);
    const elementHeight = innerRadius * 2;

    const fontSizeToUse = Math.min(newFontSize, elementHeight);

    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

    ctx.font = fontSizeToUse + "px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = 'black';

    ctx.fillText(text, centerX, centerY);
  }
};

ChartJS.register(centerTextPlugin);

export interface AgentHealthData {
  active24h: number;
  inactive24h: number;
}

interface AgentHealthChartProps extends BaseChartProps {
  data: AgentHealthData | null;
  onSegmentClick?: (status: string, count: number) => void;
}

export function AgentHealthChart({ 
  data, 
  loading, 
  error, 
  height = 300,
  onSegmentClick 
}: AgentHealthChartProps) {
  const total = data ? data.active24h + data.inactive24h : 0;

  const chartData: ChartData<'doughnut'> | null = data ? {
    labels: ['Active ', 'Inactive '],
    datasets: [
      {
        data: [data.active24h, data.inactive24h],
        backgroundColor: [
          '#22c55e', // Green for active
          '#ef4444'  // Red for inactive
        ],
        borderColor: [
          '#22c55e',
          '#ef4444'
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      }
    ]
  } : null;

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      centerText: { text: `Total: ${total}` },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels && data.datasets[0].data && total > 0) {
              return data.labels.map((label: string, i: number) => {
                const count = data.datasets[0].data[i] as number;
                const percentage = Math.round((count / total) * 100);
                return {
                  text: `${label}: ${count} (${percentage}%)`,
                  fillStyle: (data.datasets[0].backgroundColor as string[])?.[i],
                  strokeStyle: (data.datasets[0].borderColor as string[])?.[i],
                  lineWidth: 2,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context: any) => {
            const label = context.label;
            const count = context.parsed;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return `${label}: ${count} agents (${percentage}%)`;
          }
        }
      }
    } as any,
    onClick: (event, elements) => {
      if (elements.length > 0 && onSegmentClick && data) {
        const index = elements[0].index;
        const statuses = ['active', 'inactive'];
        const status = statuses[index];
        const count = [data.active24h, data.inactive24h][index];
        
        onSegmentClick(status, count);
      }
    }
  };

  return (
    <ChartContainer loading={loading} error={error} height={height}>
      <div className="relative w-full h-full">
        {chartData && <Doughnut data={chartData} options={options} height={height} />}
      </div>
    </ChartContainer>
  );
}