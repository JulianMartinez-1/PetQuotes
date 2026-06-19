'use client';

import React from 'react';
import CountUp from 'react-countup';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  orange: 'bg-orange-50 border-orange-200 text-orange-600',
  red: 'bg-red-50 border-red-200 text-red-600',
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600',
};

export default function KPICard({
  label,
  value,
  unit = '',
  change,
  trend = 'neutral',
  icon,
  color = 'blue',
}: KPICardProps) {
  return (
    <div
      className={`p-6 rounded-lg border ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              <CountUp end={value} duration={0.5} separator="," />
            </span>
            {unit && <span className="text-gray-600">{unit}</span>}
          </div>

          {/* Cambio de tendencia */}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${trendColors[trend]}`}>
              {trend === 'up' && <ArrowUp size={16} />}
              {trend === 'down' && <ArrowDown size={16} />}
              {trend === 'neutral' && <Minus size={16} />}
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{change}% vs período anterior
              </span>
            </div>
          )}
        </div>

        {/* Icono */}
        {icon && <div className="ml-4 text-3xl opacity-50">{icon}</div>}
      </div>
    </div>
  );
}
