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

export interface BacklogStatusData {
  open: number;
  whitelisted: number;
  muted: number;
}

interface BacklogStatusChartProps extends BaseChartProps {
  data: BacklogStatusData | null;
  onSegmentClick?: (status: string, count: number) => void;
}

export function BacklogStatusChart({ 
  data, 
  loading, 
  error, 
  height = 300,
  onSegmentClick 
}: BacklogStatusChartProps) {
  const total = data ? data.open + data.whitelisted + data.muted : 0;

  const chartData: ChartData<'doughnut'> | null = data ? {
    labels: ['Open', 'Whitelisted', 'Muted'],
    datasets: [
      {
        data: [data.open, data.whitelisted, data.muted],
        backgroundColor: [
          '#dc2626', // Red for open
          '#059669', // Green for whitelisted
          '#6b7280'  // Gray for muted
        ],
        borderColor: [
          '#dc2626',
          '#059669',
          '#6b7280'
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
      centerText: { text: `Total: ${total}+` },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels && data.datasets[0].data) {
              return data.labels.map((label: string, i: number) => {
                const count = data.datasets[0].data[i] as number;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
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
            return `${label}: ${count} alerts (${percentage}%)`;
          }
        }
      }
    } as any,
    onClick: (event, elements) => {
      if (elements.length > 0 && onSegmentClick && data) {
        const index = elements[0].index;
        const statuses = ['open', 'whitelisted', 'muted'];
        const status = statuses[index];
        const count = [data.open, data.whitelisted, data.muted][index];
        
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