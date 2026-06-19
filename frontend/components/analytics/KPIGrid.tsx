'use client';

import React from 'react';
import KPICard from './KPICard';
import {
  Users,
  PawPrint,
  Building2,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  totalPets: number;
  totalClinics: number;
  totalAppointments: number;
  completedAppointments: number;
  conversionRate: number;
  newUsersToday: number;
  newAppointmentsToday: number;
}

interface KPIGridProps {
  data: DashboardData;
}

export default function KPIGrid({ data }: KPIGridProps) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Total Usuarios"
        value={data.totalUsers}
        color="blue"
        icon={<Users />}
      />
      <KPICard
        label="Mascotas Registradas"
        value={data.totalPets}
        color="green"
        icon={<PawPrint />}
      />
      <KPICard
        label="Clínicas Activas"
        value={data.totalClinics}
        color="purple"
        icon={<Building2 />}
      />
      <KPICard
        label="Citas Totales"
        value={data.totalAppointments}
        color="orange"
        icon={<Calendar />}
      />
      <KPICard
        label="Citas Completadas"
        value={data.completedAppointments}
        color="green"
        icon={<CheckCircle2 />}
      />
      <KPICard
        label="Tasa de Conversión"
        value={Math.round(data.conversionRate)}
        unit="%"
        color="purple"
        icon={<TrendingUp />}
      />
      <KPICard
        label="Nuevos Usuarios Hoy"
        value={data.newUsersToday}
        color="blue"
      />
      <KPICard
        label="Nuevas Citas Hoy"
        value={data.newAppointmentsToday}
        color="orange"
      />
    </div>
  );
}
