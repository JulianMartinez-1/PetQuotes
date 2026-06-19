'use client';

import React, { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartData {
  [key: string]: string | number;
}

interface BarChartProps {
  title: string;
  data: BarChartData[];
  dataKey: string;
  nameKey: string;
  layout?: 'vertical' | 'horizontal';
  color?: string;
}

export default function BarChart({
  title,
  data,
  dataKey,
  nameKey,
  layout = 'horizontal',
  color = '#3b82f6',
}: BarChartProps) {
  const memoizedData = useMemo(() => data, [data]);

  if (!memoizedData || memoizedData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        <p>Sin datos disponibles</p>
      </div>
    );
  }

  const height = Math.max(300, memoizedData.length * 30);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={memoizedData}
          layout={layout}
          margin={
            layout === 'vertical'
              ? { top: 5, right: 30, left: 200, bottom: 5 }
              : { top: 5, right: 30, left: 0, bottom: 5 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" />
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey={nameKey}
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis style={{ fontSize: '12px' }} />
            </>
          ) : (
            <>
              <XAxis type="number" style={{ fontSize: '12px' }} />
              <YAxis dataKey={nameKey} type="category" style={{ fontSize: '12px' }} width={180} />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Bar dataKey={dataKey} fill={color} name={dataKey} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
