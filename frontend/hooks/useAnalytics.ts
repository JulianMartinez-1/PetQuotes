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

// ── Response types ────────────────────────────────────────────────────────────

export interface DashboardData {
  totalUsers: number;
  totalPets: number;
  totalClinics: number;
  totalAppointments: number;
  completedAppointments: number;
  conversionRate: number;
  newUsersToday: number;
  newAppointmentsToday: number;
  appointmentsByStatus: { status: string; count: number }[];
  appointmentsTrend: { date: string; count: number }[];
}

export interface UsersData {
  totalUsers: number;
  usersByRole: { role: string; count: number }[];
  verifiedUsers: number;
  unverifiedUsers: number;
  lockedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userRegistrationTrend: { date: string; count: number }[];
}

export interface PetsData {
  totalPets: number;
  petsBySpecies: { species: string; count: number }[];
  petsWithUpdatedVaccines: number;
  petsWithoutUpdatedVaccines: number;
  topOwnersWithPets: { ownerId: string; ownerName: string; petCount: number }[];
}

export interface AppointmentsData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
  cancellationRate: number;
  appointmentsByStatus: { status: string; count: number }[];
  appointmentsTrend: { date: string; count: number }[];
  appointmentsByClinic: { clinicId: string; clinicName: string; count: number }[];
  appointmentsByProfessional: { professionalId: string; professionalName: string; count: number }[];
  topPetsWithAppointments: { petId: string; petName: string; appointmentCount: number }[];
  topClientsWithAppointments: { clientId: string; clientName: string; appointmentCount: number }[];
}

export interface ClinicsData {
  totalClinics: number;
  verifiedClinics: number;
  unverifiedClinics: number;
  totalBranches: number;
  branchesByCity: { city: string; count: number }[];
  branchesByClinic: { clinicId: string; clinicName: string; branchCount: number }[];
}

export interface ProfessionalsData {
  totalProfessionals: number;
  activeProfessionals: number;
  inactiveProfessionals: number;
  professionalsBySpecialty: { specialty: string; count: number }[];
  professionalsByBranch: { branchId: string; branchName: string; count: number }[];
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetch analytics data through the Next.js proxy routes.
 * The proxy routes read the pq_access_token cookie and forward it as
 * Authorization: Bearer <token> to the NestJS backend, which validates
 * it and proxies to the Python analytics service.
 */
export function useAnalytics(filters: Filters) {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const queryString = queryParams.toString();
  const qs = queryString ? `?${queryString}` : '';

  const ANALYTICS_TIMEOUT = 30_000;

  const dashboardQuery = useQuery<DashboardData>({
    queryKey: ['analytics', 'dashboard', queryString],
    queryFn: () => requestJson<DashboardData>(`/api/proxy/analytics${qs}`, { timeoutMs: ANALYTICS_TIMEOUT }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const usersQuery = useQuery<UsersData>({
    queryKey: ['analytics', 'users', queryString],
    queryFn: () => requestJson<UsersData>('/api/proxy/analytics/users', { timeoutMs: ANALYTICS_TIMEOUT }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const petsQuery = useQuery<PetsData>({
    queryKey: ['analytics', 'pets', queryString],
    queryFn: () => requestJson<PetsData>('/api/proxy/analytics/pets', { timeoutMs: ANALYTICS_TIMEOUT }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const appointmentsQuery = useQuery<AppointmentsData>({
    queryKey: ['analytics', 'appointments', queryString],
    queryFn: () => requestJson<AppointmentsData>(`/api/proxy/analytics/appointments${qs}`, { timeoutMs: ANALYTICS_TIMEOUT }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const clinicsQuery = useQuery<ClinicsData>({
    queryKey: ['analytics', 'clinics', queryString],
    queryFn: () => requestJson<ClinicsData>('/api/proxy/analytics/clinics', { timeoutMs: ANALYTICS_TIMEOUT }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const professionalsQuery = useQuery<ProfessionalsData>({
    queryKey: ['analytics', 'professionals', queryString],
    queryFn: () => requestJson<ProfessionalsData>('/api/proxy/analytics/professionals', { timeoutMs: ANALYTICS_TIMEOUT }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    dashboard: dashboardQuery.data,
    users: usersQuery.data,
    pets: petsQuery.data,
    appointments: appointmentsQuery.data,
    clinics: clinicsQuery.data,
    professionals: professionalsQuery.data,
    services: undefined, // Not implemented in analytics service yet
    isLoading:
      dashboardQuery.isLoading ||
      usersQuery.isLoading ||
      petsQuery.isLoading ||
      appointmentsQuery.isLoading ||
      clinicsQuery.isLoading ||
      professionalsQuery.isLoading,
    error:
      dashboardQuery.error ||
      usersQuery.error ||
      petsQuery.error ||
      appointmentsQuery.error ||
      clinicsQuery.error ||
      professionalsQuery.error,
  };
}
