'use client';

import { Suspense, useState } from 'react';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

const DEMO_APPOINTMENTS_BY_MONTH = [
  { month: 'Ene', citas: 58 },
  { month: 'Feb', citas: 72 },
  { month: 'Mar', citas: 91 },
  { month: 'Abr', citas: 84 },
  { month: 'May', citas: 113 },
  { month: 'Jun', citas: 97 },
];

const DEMO_TOP_PETS = [
  { mascota: 'Max (Golden)', visitas: 14 },
  { mascota: 'Luna (Labrador)', visitas: 11 },
  { mascota: 'Simba (Persa)', visitas: 9 },
  { mascota: 'Rocky (Bulldog)', visitas: 8 },
  { mascota: 'Nala (Siamés)', visitas: 7 },
];

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

  const hasData = dashboard || appointments || users || pets || clinics || professionals;
  const hasError = !isLoading && error && !hasData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {!isLoading && <FiltersBar filters={filters} onFiltersChange={setFilters} />}

      {/* Cuadros de demo — siempre visibles desde el primer render */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas por Mes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsBar data={DEMO_APPOINTMENTS_BY_MONTH} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" style={{ fontSize: '13px' }} />
              <YAxis style={{ fontSize: '13px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                formatter={(v) => [`${v} citas`, 'Total']}
              />
              <Bar dataKey="citas" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Citas" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mascotas Más Frecuentes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsBar data={DEMO_TOP_PETS} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '12px' }} />
              <YAxis dataKey="mascota" type="category" style={{ fontSize: '11px' }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                formatter={(v) => [`${v} visitas`, 'Visitas']}
              />
              <Bar dataKey="visitas" fill="#10b981" radius={[0, 4, 4, 0]} name="Visitas" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {hasError && (() => {
        const message = (error as any)?.message ?? 'Error desconocido';
        const isUnavailable = message.toLowerCase().includes('servicio') || message.includes('503') || message.includes('504');
        return (
          <div className="mt-8 flex flex-col items-center gap-4 text-center py-8">
            <AlertTriangle size={40} className="text-warning" />
            <h2 className="text-lg font-bold text-text-primary">
              {isUnavailable ? 'Servicio de analítica no disponible' : 'Error al cargar analíticas'}
            </h2>
            <p className="text-text-secondary max-w-md text-sm">
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
      })()}

      {!isLoading && !hasError && dashboard && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Indicadores Principales</h2>
          <KPIGrid data={dashboard} />
        </div>
      )}

      {!isLoading && !hasError && (
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
      )}
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
