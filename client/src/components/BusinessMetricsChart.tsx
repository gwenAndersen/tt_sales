import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useBusinessMetrics } from '@/hooks/use-business-metrics';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';

export default function BusinessMetricsChart() {
  const { metrics, isLoading } = useBusinessMetrics();

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  if (!metrics || metrics.length === 0) {
    return <div>No metrics data available.</div>;
  }

  // Prepare data for recharts
  const chartData = metrics.map(metric => ({
    date: format(new Date(metric.date), 'MMM dd'),
    revenue: parseFloat(metric.revenue as any),
    sales: parseFloat(metric.sales as any),
    expenses: metric.expenses ? parseFloat(metric.expenses as any) : 0,
    profit: metric.profit ? parseFloat(metric.profit as any) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Metrics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="sales" stroke="#82ca9d" />
            <Line type="monotone" dataKey="expenses" stroke="#ffc658" />
            <Line type="monotone" dataKey="profit" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
