import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Title,
  type ChartData, type ChartOptions
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Title);

interface ChartProps {
  data: any;
  loading: boolean;
  error: string | null;
  onBarClick?: (name: string, count: number, hostname: string) => void;
}

function isValidBarChartData(data: any) {
  return data && Array.isArray(data.labels) && Array.isArray(data.datasets);
}

export function EventsPerHourChart({ data, loading, error, height, bottom }: ChartProps & { height: number, bottom: number }) {
  const chartData = Array.isArray(data) && data.every(item => typeof item === 'number') 
    ? {
        labels: Array.from({ length: 24 }, (_, i) => i.toString()),
        datasets: [{
          data: data,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
        }],
      }
    : data;
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { bottom: bottom } },
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: true } }, y: { title: { display: true, text: 'Count' }, beginAtZero: true } }
  };
  if (loading) return <div className="h-[220px] flex items-center justify-center text-gray-400">Loading...</div>;
  if (error) return <div className="h-[220px] flex items-center justify-center text-red-500">{error}</div>;
  if (!isValidBarChartData(chartData)) return <div className="h-[220px] flex items-center justify-center text-gray-400">No data</div>;
  return <Line data={chartData} options={options} height={height} />;
}

function transformToChartData(rawData: { hostname: string; name: string; count: number }[]): ChartData<'bar'> {
  return {
    labels: rawData.map(item => `${item.hostname} ${item.name != item.hostname ? `(${item.name})` : ''}`),
    datasets: [{
      data: rawData.map(item => item.count),
      backgroundColor: '#4F46E5',
    }],
  };
}

export function TopProcessesChart({ data, loading, error, onBarClick }: ChartProps) {
  const chartData = Array.isArray(data) ? transformToChartData(data) : data;
  const options: ChartOptions<'bar'> = {
    responsive: true,
    datasets: { bar: { backgroundColor: '#4F46E5' } },
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: false }, ticks: { display: false, color: '#374151' } },
      y: { title: { display: true, text: 'Count' }, beginAtZero: true }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick && data) {
        const dataIndex = elements[0].index;
        const name = data[dataIndex].name;
        const count = data[dataIndex].count;
        const hostname = data[dataIndex].hostname;
        onBarClick(name, count, hostname);
      }
    }
  };
  if (loading) return <div className="h-[180px] flex items-center justify-center text-gray-400">Loading...</div>;
  if (error) return <div className="h-[180px] flex items-center justify-center text-red-500">{error}</div>;
  if (!isValidBarChartData(chartData)) return <div className="h-[180px] flex items-center justify-center text-gray-400">No data</div>;
  return <Bar data={chartData} options={options} height={150} />;
}

export function TopUsersChart({ data, loading, error, onBarClick }: ChartProps) {
  const chartData = Array.isArray(data) ? transformToChartData(data) : data;
  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: true },
        ticks: { display: false }
      },
      y: { title: { display: true, text: 'Count' }, beginAtZero: true }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick && data) {
        const dataIndex = elements[0].index;
        const name = data[dataIndex].name;
        const count = data[dataIndex].count;
        const hostname = data[dataIndex].hostname;
        onBarClick(name, count, hostname);
      }
    }
  };
  if (loading) return <div className="h-[180px] flex items-center justify-center text-gray-400">Loading...</div>;
  if (error) return <div className="h-[180px] flex items-center justify-center text-red-500">{error}</div>;
  if (!isValidBarChartData(chartData)) return <div className="h-[180px] flex items-center justify-center text-gray-400">No data</div>;
  return <Bar data={chartData} options={options} height={180} />;
}

// GitHub-style weekday x hour heatmap
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))



function getColor(val: number, max: number) {
  // 0 = light, max = dark blue
  if (val === 0) return 'bg-blue-50';
  if (val < max * 0.25) return 'bg-blue-200';
  if (val < max * 0.5) return 'bg-blue-400';
  if (val < max * 0.75) return 'bg-blue-500';
  return 'bg-blue-700';
}

export function HeatmapChart({ data, loading, error }: ChartProps) {
  if (loading) return <div className="h-[220px] flex items-center justify-center text-gray-400">Loading...</div>;
  if (error) return <div className="h-[220px] flex items-center justify-center text-red-500">{error}</div>;
  if (!data) return <div className="h-[220px] flex items-center justify-center text-gray-400">No data</div>;
  
  let heatmapData: number[][];
  if (Array.isArray(data) && data.length === 168 && data.every(item => typeof item === 'number')) {
    // Reshape flat array to 7x24
    heatmapData = [];
    for (let i = 0; i < 7; i++) {
      heatmapData.push(data.slice(i * 24, (i + 1) * 24));
    }
  } else if (Array.isArray(data) && Array.isArray(data[0])) {
    heatmapData = data;
  } else {
    return <div className="h-[220px] flex items-center justify-center text-gray-400">No data</div>;
  }
  
  const max = Math.max(...heatmapData.flat());
  return (
    <div className="overflow-x-auto">
      <div className="mb-2 text-sm font-semibold text-gray-600">Heatmap: Weekdays × Hours</div>
      <div className="inline-block">
        <div className="flex text-xs text-gray-400 pl-12">
          {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
            <div key={h} className="w-6 text-center">{h}</div>
          ))}
        </div>
        <div>
          {heatmapData.map((row: number[], i: number) => (
            <div key={i} className="flex items-center">
              <div className="w-10 text-xs text-gray-400 pr-2 text-right">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</div>
              {row.map((val, j) => (
                <div
                  key={j}
                  className={`w-6 h-6 m-[1px] rounded ${val === 0 ? 'bg-blue-50' : val < max * 0.25 ? 'bg-blue-200' : val < max * 0.5 ? 'bg-blue-400' : val < max * 0.75 ? 'bg-blue-500' : 'bg-blue-700'} border border-blue-100 flex items-center justify-center`}
                  title={`Day: ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}, Hour: ${Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))[j]}, Count: ${val}`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TopKeysChart({ data, loading, error, onBarClick }: ChartProps) {
  const chartData = Array.isArray(data) ? transformToChartData(data) : data;
  if (loading) return <div className="h-[180px] flex items-center justify-center text-gray-400">Loading...</div>;
  if (error) return <div className="h-[180px] flex items-center justify-center text-red-500">{error}</div>;
  if (!isValidBarChartData(chartData)) return <div className="h-[180px] flex items-center justify-center text-gray-400">No data</div>;
  return <Bar data={chartData} options={{ plugins: { legend: { display: false } }, scales: {
      x: {
        grid: { display: true },
        ticks: { display: false }
      },
      y: { title: { display: false, text: 'Count' }, beginAtZero: true }
    },
  onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick && data) {
        const dataIndex = elements[0].index;
        const name = data[dataIndex].name;
        const count = data[dataIndex].count;
        const hostname = data[dataIndex].hostname;
        onBarClick(name, count, hostname);
      }
    }
  }} height={180} />;
}
