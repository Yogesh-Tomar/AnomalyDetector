import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SuppressionTrendData {
  d: string;  // Changed from 'date' to 'd' to match the passed data structure
  whitelisted: number;
  muted: number;
  actionable: number;
}

interface SuppressionTrendChartProps {
  data: SuppressionTrendData[] | null;  // Allow null to match the assignable type
  loading?: boolean;
  error?: string | null;
}

export const SuppressionTrendChart: React.FC<SuppressionTrendChartProps> = ({ data, loading, error }) => {
  if (loading) {
    return <div className="h-64 flex items-center justify-center text-gray-500">Loading suppression trend data...</div>;
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  // Format data for Recharts: Parse dates and ensure sorting by date
  const formattedData = data
    .map(item => ({
      ...item,
      d: new Date(item.d), // Parse to Date object for proper axis handling (changed from 'date' to 'd')
    }))
    .sort((a, b) => a.d.getTime() - b.d.getTime()) // Sort by date ascending
    .map(item => ({
      ...item,
      d: item.d.toLocaleDateString(), // Format for display (e.g., "9/17/2025")
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="d" />  // Changed from 'date' to 'd'
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="whitelisted" stroke="#3B82F6" strokeWidth={2} name="Whitelisted" />
        <Line type="monotone" dataKey="muted" stroke="#F59E0B" strokeWidth={2} name="Muted" />
        <Line type="monotone" dataKey="actionable" stroke="#10B981" strokeWidth={2} name="Actionable" />
      </LineChart>
    </ResponsiveContainer>
  );
};