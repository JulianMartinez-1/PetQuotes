'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface TimeSeriesData {
  date: string;
  count: number;
}

interface TimeSeriesChartProps {
  title: string;
  data: TimeSeriesData[];
  variant?: 'line' | 'area';
}

export default function TimeSeriesChart({
  title,
  data,
  variant = 'line',
}: TimeSeriesChartProps) {
  const memoizedData = useMemo(() => data, [data]);

  if (!memoizedData || memoizedData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        <p>Sin datos disponibles</p>
      </div>
    );
  }

  const Chart = variant === 'area' ? AreaChart : LineChart;
  const LineOrArea = variant === 'area' ? Area : Line;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Chart data={memoizedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
            formatter={(value) => [value, 'Count']}
          />
          <Legend />
          <LineOrArea
            type="monotone"
            dataKey="count"
            stroke="#1e40af"
            fill={variant === 'area' ? '#3b82f6' : undefined}
            dot={false}
            strokeWidth={2}
            name="Cantidad"
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
