import { IsDateString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class AnalyticsFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}

// ============================================================
// DASHBOARD (KPIs PRINCIPALES)
// ============================================================

export class KPIDto {
  label: string;
  value: number;
  change?: number; // Porcentaje de cambio
  trend?: 'up' | 'down' | 'neutral';
}

export class DashboardResponseDto {
  totalUsers: number;
  totalPets: number;
  totalClinics: number;
  totalAppointments: number;
  completedAppointments: number;
  conversionRate: number;
  newUsersToday: number;
  newAppointmentsToday: number;
  appointmentsByStatus: Array<{
    status: string;
    count: number;
  }>;
  appointmentsTrend: Array<{
    date: string;
    count: number;
  }>;
}

// ============================================================
// USUARIOS
// ============================================================

export class UserMetricsDto {
  totalUsers: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  verifiedUsers: number;
  unverifiedUsers: number;
  lockedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userRegistrationTrend: Array<{
    date: string;
    count: number;
  }>;
}

// ============================================================
// MASCOTAS
// ============================================================

export class PetMetricsDto {
  totalPets: number;
  petsBySpecies: Array<{
    species: string;
    count: number;
  }>;
  petsWithUpdatedVaccines: number;
  petsWithoutUpdatedVaccines: number;
  topOwnersWithPets: Array<{
    ownerId: string;
    ownerName: string;
    petCount: number;
  }>;
}

// ============================================================
// CITAS
// ============================================================

export class AppointmentMetricsDto {
  totalAppointments: number;
  appointmentsByStatus: Array<{
    status: string;
    count: number;
  }>;
  appointmentsTrend: Array<{
    date: string;
    count: number;
  }>;
  appointmentsByClinic: Array<{
    clinicId: string;
    clinicName: string;
    count: number;
  }>;
  appointmentsByProfessional: Array<{
    professionalId: string;
    professionalName: string;
    count: number;
  }>;
  cancellationRate: number;
  completionRate: number;
  topPetsWithAppointments: Array<{
    petId: string;
    petName: string;
    appointmentCount: number;
  }>;
  topClientsWithAppointments: Array<{
    clientId: string;
    clientName: string;
    appointmentCount: number;
  }>;
}

// ============================================================
// CLÍNICAS
// ============================================================

export class ClinicMetricsDto {
  totalClinics: number;
  verifiedClinics: number;
  unverifiedClinics: number;
  clinicsByOwner: Array<{
    ownerId: string;
    ownerName: string;
    clinicCount: number;
  }>;
  totalBranches: number;
  branchesByCity: Array<{
    city: string;
    count: number;
  }>;
  branchesByClinic: Array<{
    clinicId: string;
    clinicName: string;
    branchCount: number;
  }>;
}

// ============================================================
// PROFESIONALES
// ============================================================

export class ProfessionalMetricsDto {
  totalProfessionals: number;
  activeProfessionals: number;
  inactiveProfessionals: number;
  professionalsBySpecialty: Array<{
    specialty: string;
    count: number;
  }>;
  professionalsByBranch: Array<{
    branchId: string;
    branchName: string;
    count: number;
  }>;
}

// ============================================================
// SERVICIOS
// ============================================================

export class ServiceMetricsDto {
  totalServices: number;
  activeServices: number;
  servicesByCategory: Array<{
    category: string;
    count: number;
  }>;
  averagePriceByCategory: Array<{
    category: string;
    averagePrice: number;
  }>;
  mostBookedServices: Array<{
    serviceId: string;
    serviceName: string;
    bookingCount: number;
  }>;
}

// ============================================================
// HISTORIAL MÉDICO, VACUNAS, MEDICAMENTOS
// ============================================================

export class MedicalMetricsDto {
  totalMedicalRecords: number;
  totalVaccines: number;
  vaccinesToExpireSoon: number; // Próximos 30 días
  totalMedications: number;
  activeMedications: number;
  completedMedications: number;
}

// ============================================================
// NOTIFICACIONES
// ============================================================

export class NotificationMetricsDto {
  totalNotifications: number;
  notificationsByType: Array<{
    type: string;
    count: number;
  }>;
  readNotifications: number;
  unreadNotifications: number;
  readRate: number;
}
