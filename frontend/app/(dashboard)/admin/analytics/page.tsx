'use client';

import { Suspense, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import FiltersBar from '@/components/analytics/FiltersBar';
import KPIGrid from '@/components/analytics/KPIGrid';
import DashboardLayout from '@/components/analytics/DashboardLayout';
import TimeSeriesChart from '@/components/analytics/charts/TimeSeriesChart';
import BarChart from '@/components/analytics/charts/BarChart';
import PieChart from '@/components/analytics/charts/PieChart';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface Filters {
  startDate?: string;
  endDate?: string;
  clinicId?: string;
  branchId?: string;
  professionalId?: string;
  status?: string;
}

function AnalyticsContent() {
  const [filters, setFilters] = useState<Filters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const {
    dashboard,
    users,
    pets,
    appointments,
    clinics,
    professionals,
    services,
    isLoading,
  } = useAnalytics(filters);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Barra de Filtros */}
      <FiltersBar filters={filters} onFiltersChange={setFilters} />

      {/* KPIs Principales */}
      {dashboard && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Indicadores Principales
          </h2>
          <KPIGrid data={dashboard} />
        </div>
      )}

      {/* Gráficas */}
      <DashboardLayout>
        {/* Tendencia de Citas */}
        {appointments?.appointmentsTrend && (
          <div className="lg:col-span-2">
            <TimeSeriesChart
              title="Citas por Día"
              data={appointments.appointmentsTrend}
            />
          </div>
        )}

        {/* Citas por Estado */}
        {appointments?.appointmentsByStatus && (
          <div>
            <PieChart
              title="Citas por Estado"
              data={appointments.appointmentsByStatus}
            />
          </div>
        )}

        {/* Usuarios por Rol */}
        {users?.usersByRole && (
          <div>
            <BarChart
              title="Usuarios por Rol"
              data={users.usersByRole}
              dataKey="count"
              nameKey="role"
            />
          </div>
        )}

        {/* Mascotas por Especie */}
        {pets?.petsBySpecies && (
          <div>
            <BarChart
              title="Mascotas por Especie"
              data={pets.petsBySpecies}
              dataKey="count"
              nameKey="species"
            />
          </div>
        )}

        {/* Profesionales por Especialidad */}
        {professionals?.professionalsBySpecialty && (
          <div className="lg:col-span-2">
            <BarChart
              title="Profesionales por Especialidad"
              data={professionals.professionalsBySpecialty}
              dataKey="count"
              nameKey="specialty"
              layout="vertical"
            />
          </div>
        )}

        {/* Clínicas Verificadas */}
        {clinics && (
          <div>
            <PieChart
              title="Estado de Clínicas"
              data={[
                {
                  name: 'Verificadas',
                  count: clinics.verifiedClinics,
                },
                {
                  name: 'No Verificadas',
                  count: clinics.unverifiedClinics,
                },
              ]}
            />
          </div>
        )}

        {/* Top Clientes */}
        {appointments?.topClientsWithAppointments && (
          <div className="lg:col-span-2">
            <BarChart
              title="Top 10 Clientes por Citas"
              data={appointments.topClientsWithAppointments.slice(0, 10)}
              dataKey="appointmentCount"
              nameKey="clientName"
              layout="vertical"
            />
          </div>
        )}

        {/* Top Mascotas */}
        {appointments?.topPetsWithAppointments && (
          <div className="lg:col-span-2">
            <BarChart
              title="Top 10 Mascotas Atendidas"
              data={appointments.topPetsWithAppointments.slice(0, 10)}
              dataKey="appointmentCount"
              nameKey="petName"
              layout="vertical"
            />
          </div>
        )}

        {/* Registros de Usuarios */}
        {users?.userRegistrationTrend && (
          <div className="lg:col-span-2">
            <TimeSeriesChart
              title="Registros de Usuarios por Día"
              data={users.userRegistrationTrend}
            />
          </div>
        )}
      </DashboardLayout>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnalyticsContent />
    </Suspense>
  );
}
