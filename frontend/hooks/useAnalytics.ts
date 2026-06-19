import { useQuery } from '@tanstack/react-query';
import { requestJson } from '@/lib/api-client';

interface Filters {
  startDate?: string;
  endDate?: string;
  clinicId?: string;
  branchId?: string;
  professionalId?: string;
  status?: string;
}

/**
 * Hook para consumir datos de analítica con React Query
 * Maneja caching automático y reintentos
 */
export function useAnalytics(filters: Filters) {
  // Convertir filtros a query string
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const queryString = queryParams.toString();

  // Dashboard (KPIs principales)
  const dashboardQuery = useQuery({
    queryKey: ['analytics', 'dashboard', queryString],
    queryFn: () =>
      requestJson(`/api/analytics/dashboard?${queryString}`, {
        method: 'GET',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  // Usuarios
  const usersQuery = useQuery({
    queryKey: ['analytics', 'users', queryString],
    queryFn: () =>
      requestJson(`/api/analytics/users?${queryString}`, {
        method: 'GET',
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Mascotas
  const petsQuery = useQuery({
    queryKey: ['analytics', 'pets', queryString],
    queryFn: () =>
      requestJson(`/api/analytics/pets?${queryString}`, {
        method: 'GET',
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Citas
  const appointmentsQuery = useQuery({
    queryKey: ['analytics', 'appointments', queryString],
    queryFn: () =>
      requestJson(`/api/analytics/appointments?${queryString}`, {
        method: 'GET',
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Clínicas
  const clinicsQuery = useQuery({
    queryKey: ['analytics', 'clinics', queryString],
    queryFn: () =>
      requestJson(`/api/analytics/clinics?${queryString}`, {
        method: 'GET',
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Profesionales
  const professionalsQuery = useQuery({
    queryKey: ['analytics', 'professionals', queryString],
    queryFn: () =>
      requestJson(`/api/analytics/professionals?${queryString}`, {
        method: 'GET',
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Servicios
  const servicesQuery = useQuery({
    queryKey: ['analytics', 'services', queryString],
    queryFn: () =>
      requestJson(`/api/analytics/services?${queryString}`, {
        method: 'GET',
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    dashboard: dashboardQuery.data,
    users: usersQuery.data,
    pets: petsQuery.data,
    appointments: appointmentsQuery.data,
    clinics: clinicsQuery.data,
    professionals: professionalsQuery.data,
    services: servicesQuery.data,
    isLoading:
      dashboardQuery.isLoading ||
      usersQuery.isLoading ||
      petsQuery.isLoading ||
      appointmentsQuery.isLoading ||
      clinicsQuery.isLoading ||
      professionalsQuery.isLoading ||
      servicesQuery.isLoading,
    error:
      dashboardQuery.error ||
      usersQuery.error ||
      petsQuery.error ||
      appointmentsQuery.error ||
      clinicsQuery.error ||
      professionalsQuery.error ||
      servicesQuery.error,
  };
}
