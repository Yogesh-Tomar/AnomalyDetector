import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, AreaChart } from 'recharts';

interface DataQualityChartsProps {
  data: any[] | null;
  loading: boolean;
  error: any;
}

const DataQualityCharts: React.FC<DataQualityChartsProps> = ({ data, loading, error }) => {
  const [selectedChart, setSelectedChart] = useState('timeline');

  // Handle loading and error states
  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading data.</div>;
  if (!data || data.length === 0) return <div className="p-4 text-gray-400">No data available.</div>;

  // Format data for charts
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    totalRows: item.totalRows,
    uniqueEvents: item.uniqueEvents,
    duplicateRate: (item.duplicateRate * 100).toFixed(2),
    duplicateCount: item.totalRows - item.uniqueEvents
  }));

  const chartOptions = [
    { key: 'timeline', label: 'Timeline View' },
    { key: 'composed', label: 'Combined Metrics' },
    { key: 'area', label: 'Area Chart' },
    { key: 'bar', label: 'Bar Comparison' }
  ];

  const renderChart = () => {
    switch(selectedChart) {
      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalRows" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Total Rows"
              />
              <Line 
                type="monotone" 
                dataKey="uniqueEvents" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Unique Events"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="uniqueEvents" fill="#10b981" name="Unique Events" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="duplicateRate" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Duplicate Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="totalRows" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Total Rows"
              />
              <Area 
                type="monotone" 
                dataKey="uniqueEvents" 
                stackId="2"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                name="Unique Events"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="uniqueEvents" fill="#10b981" name="Unique Events" />
              <Bar dataKey="duplicateCount" fill="#ef4444" name="Duplicates" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Get latest metrics for summary
  const latestData = data[data.length - 1];
  const totalEvents = data.reduce((sum, item) => sum + item.totalRows, 0);
  const avgDuplicateRate = data.reduce((sum, item) => sum + item.duplicateRate, 0) / data.length;

  return (
    <div>
      <div className="flex justify-between items-center">
        {/* <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Quality Metrics</h3>
          <p className="text-sm text-gray-600">Event processing statistics</p>
        </div> */}
        
        <div className="flex gap-2">
          {chartOptions.map(option => (
            <button
              key={option.key}
              onClick={() => setSelectedChart(option.key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedChart === option.key
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-3">
            {/* Chart */}
            <div className="mt-4">
                {renderChart()}
            </div>

            {/* Quality Indicator */}
            <div className="mt-4 flex items-center justify-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                avgDuplicateRate === 0 
                    ? 'bg-green-100 text-green-800' 
                    : avgDuplicateRate < 0.1 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                    avgDuplicateRate === 0 
                    ? 'bg-green-500' 
                    : avgDuplicateRate < 0.1 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}></div>
                {avgDuplicateRate === 0 ? 'Excellent Quality' : avgDuplicateRate < 0.1 ? 'Good Quality' : 'Needs Attention'}
                </div>
            </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Total Events</div>
            <div className="text-2xl font-bold text-blue-900">{totalEvents.toLocaleString()}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Latest Unique</div>
            <div className="text-2xl font-bold text-green-900">{latestData.uniqueEvents.toLocaleString()}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Avg Duplicate Rate</div>
            <div className="text-2xl font-bold text-purple-900">{(avgDuplicateRate * 100).toFixed(1)}%</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">Data Points</div>
            <div className="text-2xl font-bold text-orange-900">{data.length}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityCharts;