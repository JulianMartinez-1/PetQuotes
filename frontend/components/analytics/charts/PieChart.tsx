'use client';

import React, { useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PieChartData {
  name: string;
  count: number;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  variant?: 'pie' | 'donut';
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function PieChart({ title, data, variant = 'pie' }: PieChartProps) {
  const memoizedData = useMemo(() => data, [data]);

  if (!memoizedData || memoizedData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        <p>Sin datos disponibles</p>
      </div>
    );
  }

  const innerRadius = variant === 'donut' ? 60 : 0;
  const outerRadius = 100;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={memoizedData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="count"
            label={({ name, count }) => `${name}: ${count}`}
          >
            {memoizedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
            formatter={(value) => [`${value}`, 'Count']}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
