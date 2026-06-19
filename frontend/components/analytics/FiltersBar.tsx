'use client';

import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface Filters {
  startDate?: string;
  endDate?: string;
  clinicId?: string;
  branchId?: string;
  professionalId?: string;
  status?: string;
}

interface FiltersBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const appointmentStatuses = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'RESCHEDULED',
  'COMPLETED',
];

export default function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
  const [showFilters, setShowFilters] = useState(true);

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: filters.status === status ? undefined : status,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      clinicId: undefined,
      branchId: undefined,
      professionalId: undefined,
      status: undefined,
    });
  };

  if (!showFilters) {
    return (
      <button
        onClick={() => setShowFilters(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        <Calendar size={18} />
        Mostrar Filtros
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={() => setShowFilters(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        {/* Estado de Cita */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de Cita
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="">Todos</option>
            {appointmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Reset */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Restablecer
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        ℹ️ Rango máximo: 1 año. Todos los datos se cargan en tiempo real desde la
        base de datos.
      </div>
    </div>
  );
}
