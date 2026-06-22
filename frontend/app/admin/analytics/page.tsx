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
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    isLoading,
    error,
  } = useAnalytics(filters);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const hasData = dashboard || appointments || users || pets || clinics || professionals;

  if (error && !hasData) {
    const message = (error as any)?.message ?? 'Error desconocido';
    const isUnavailable = message.toLowerCase().includes('servicio') || message.includes('503') || message.includes('504');
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertTriangle size={48} className="text-warning" />
        <h2 className="text-xl font-bold text-text-primary">
          {isUnavailable ? 'Servicio de analítica no disponible' : 'Error al cargar analíticas'}
        </h2>
        <p className="text-text-secondary max-w-md">
          {isUnavailable
            ? 'El servicio de analítica no está corriendo. Asegúrate de que el contenedor Docker esté activo.'
            : message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          <RefreshCw size={15} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <FiltersBar filters={filters} onFiltersChange={setFilters} />

      {dashboard && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Indicadores Principales
          </h2>
          <KPIGrid data={dashboard} />
        </div>
      )}

      <DashboardLayout>
        {appointments?.appointmentsTrend && (
          <div className="lg:col-span-2">
            <TimeSeriesChart
              title="Citas por Día"
              data={appointments.appointmentsTrend}
            />
          </div>
        )}

        {appointments?.appointmentsByStatus && (
          <div>
            <PieChart
              title="Citas por Estado"
              data={appointments.appointmentsByStatus.map((s) => ({
                name: s.status,
                count: s.count,
              }))}
            />
          </div>
        )}

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

        {clinics && (
          <div>
            <PieChart
              title="Estado de Clínicas"
              data={[
                { name: 'Verificadas', count: clinics.verifiedClinics },
                { name: 'No Verificadas', count: clinics.unverifiedClinics },
              ]}
            />
          </div>
        )}

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
