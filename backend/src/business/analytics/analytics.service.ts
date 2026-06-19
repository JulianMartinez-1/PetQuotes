import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  AnalyticsFiltersDto,
  DashboardResponseDto,
  UserMetricsDto,
  PetMetricsDto,
  AppointmentMetricsDto,
  ClinicMetricsDto,
  ProfessionalMetricsDto,
  ServiceMetricsDto,
  MedicalMetricsDto,
  NotificationMetricsDto,
} from '@presentation/analytics/analytics.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validar y normalizar fechas
   */
  private getDateRange(filters: AnalyticsFiltersDto) {
    let startDate = new Date(filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    let endDate = new Date(filters.endDate || new Date());

    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('startDate inválida');
    }
    if (isNaN(endDate.getTime())) {
      throw new BadRequestException('endDate inválida');
    }
    if (startDate > endDate) {
      throw new BadRequestException('startDate no puede ser mayor que endDate');
    }

    // Limitar a máximo 1 año para evitar consultas pesadas
    const maxRangeMs = 365 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > maxRangeMs) {
      throw new BadRequestException('El rango de fechas no puede exceder 1 año');
    }

    return { startDate, endDate };
  }

  // ============================================================
  // DASHBOARD PRINCIPAL
  // ============================================================

  async getDashboard(filters: AnalyticsFiltersDto): Promise<DashboardResponseDto> {
    const { startDate, endDate } = this.getDateRange(filters);

    // Consultas en paralelo para mejor performance
    const [
      totalUsers,
      totalPets,
      totalClinics,
      totalAppointments,
      completedAppointments,
      newUsersToday,
      newAppointmentsToday,
      appointmentsByStatus,
      appointmentsTrend,
    ] = await Promise.all([
      // Total de usuarios
      this.prisma.user.count(),

      // Total de mascotas
      this.prisma.pet.count(),

      // Total de clínicas
      this.prisma.clinic.count(),

      // Total de citas
      this.prisma.appointment.count({
        where: {
          startTime: { gte: startDate, lte: endDate },
        },
      }),

      // Citas completadas
      this.prisma.appointment.count({
        where: {
          status: 'COMPLETED',
          startTime: { gte: startDate, lte: endDate },
        },
      }),

      // Nuevos usuarios hoy
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),

      // Nuevas citas hoy
      this.prisma.appointment.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),

      // Citas por estado
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: {
          startTime: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),

      // Tendencia de citas por día
      this.prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(start_time) as date, COUNT(*) as count
        FROM appointments
        WHERE start_time BETWEEN ${startDate} AND ${endDate}
        GROUP BY DATE(start_time)
        ORDER BY date ASC
      `,
    ]);

    const conversionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    return {
      totalUsers,
      totalPets,
      totalClinics,
      totalAppointments,
      completedAppointments,
      conversionRate: Math.round(conversionRate * 100) / 100,
      newUsersToday,
      newAppointmentsToday,
      appointmentsByStatus: appointmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      appointmentsTrend: appointmentsTrend.map((item) => ({
        date: item.date,
        count: Number(item.count),
      })),
    };
  }

  // ============================================================
  // MÉTRICAS DE USUARIOS
  // ============================================================

  async getUserMetrics(filters: AnalyticsFiltersDto): Promise<UserMetricsDto> {
    const { startDate, endDate } = this.getDateRange(filters);

    const [
      totalUsers,
      usersByRole,
      verifiedUsers,
      unverifiedUsers,
      lockedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      userRegistrationTrend,
    ] = await Promise.all([
      // Total usuarios
      this.prisma.user.count(),

      // Usuarios por rol
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // Usuarios verificados
      this.prisma.user.count({ where: { emailVerified: true } }),

      // Usuarios no verificados
      this.prisma.user.count({ where: { emailVerified: false } }),

      // Usuarios bloqueados
      this.prisma.user.count({
        where: {
          lockedUntil: { gt: new Date() },
        },
      }),

      // Nuevos usuarios hoy
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // Nuevos usuarios esta semana
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Nuevos usuarios este mes
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Tendencia de registros por día
      this.prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return {
      totalUsers,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      verifiedUsers,
      unverifiedUsers,
      lockedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      userRegistrationTrend: userRegistrationTrend.map((item) => ({
        date: item.date,
        count: Number(item.count),
      })),
    };
  }

  // ============================================================
  // MÉTRICAS DE MASCOTAS
  // ============================================================

  async getPetMetrics(filters: AnalyticsFiltersDto): Promise<PetMetricsDto> {
    const { startDate, endDate } = this.getDateRange(filters);

    const [
      totalPets,
      petsBySpecies,
      petsWithUpdatedVaccines,
      petsWithoutUpdatedVaccines,
      topOwnersWithPets,
    ] = await Promise.all([
      // Total mascotas
      this.prisma.pet.count(),

      // Mascotas por especie
      this.prisma.pet.groupBy({
        by: ['species'],
        _count: true,
      }),

      // Mascotas con vacunas al día
      this.prisma.pet.count({
        where: { vaccinesUpToDate: true },
      }),

      // Mascotas sin vacunas al día
      this.prisma.pet.count({
        where: { vaccinesUpToDate: false },
      }),

      // Top 10 dueños con más mascotas
      this.prisma.$queryRaw<
        Array<{
          owner_id: string;
          owner_name: string;
          pet_count: number;
        }>
      >`
        SELECT u.id as owner_id, u.full_name as owner_name, COUNT(p.id) as pet_count
        FROM users u
        JOIN pets p ON u.id = p.owner_id
        GROUP BY u.id, u.full_name
        ORDER BY pet_count DESC
        LIMIT 10
      `,
    ]);

    return {
      totalPets,
      petsBySpecies: petsBySpecies.map((item) => ({
        species: item.species || 'Desconocida',
        count: item._count,
      })),
      petsWithUpdatedVaccines,
      petsWithoutUpdatedVaccines,
      topOwnersWithPets: topOwnersWithPets.map((item) => ({
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        petCount: item.pet_count,
      })),
    };
  }

  // ============================================================
  // MÉTRICAS DE CITAS
  // ============================================================

  async getAppointmentMetrics(filters: AnalyticsFiltersDto): Promise<AppointmentMetricsDto> {
    const { startDate, endDate } = this.getDateRange(filters);

    const whereClause: any = {
      startTime: { gte: startDate, lte: endDate },
    };

    if (filters.clinicId) whereClause.clinicId = filters.clinicId;
    if (filters.professionalId) whereClause.professionalId = filters.professionalId;
    if (filters.status) whereClause.status = filters.status;

    const [
      totalAppointments,
      appointmentsByStatus,
      appointmentsTrend,
      appointmentsByClinic,
      appointmentsByProfessional,
      completedAppointments,
      cancelledAppointments,
      topPetsWithAppointments,
      topClientsWithAppointments,
    ] = await Promise.all([
      // Total citas
      this.prisma.appointment.count({ where: whereClause }),

      // Citas por estado
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),

      // Tendencia de citas por día
      this.prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(start_time) as date, COUNT(*) as count
        FROM appointments
        WHERE start_time BETWEEN ${startDate} AND ${endDate}
        ${filters.clinicId ? `AND clinic_id = '${filters.clinicId}'` : ''}
        ${filters.professionalId ? `AND professional_id = '${filters.professionalId}'` : ''}
        GROUP BY DATE(start_time)
        ORDER BY date ASC
      `,

      // Citas por clínica
      this.prisma.$queryRaw<
        Array<{
          clinic_id: string;
          clinic_name: string;
          count: number;
        }>
      >`
        SELECT c.id as clinic_id, c.name as clinic_name, COUNT(a.id) as count
        FROM clinics c
        LEFT JOIN appointments a ON c.id = a.clinic_id AND a.start_time BETWEEN ${startDate} AND ${endDate}
        GROUP BY c.id, c.name
        ORDER BY count DESC
      `,

      // Citas por profesional
      this.prisma.$queryRaw<
        Array<{
          professional_id: string;
          professional_name: string;
          count: number;
        }>
      >`
        SELECT p.id as professional_id, u.full_name as professional_name, COUNT(a.id) as count
        FROM professionals p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN appointments a ON p.id = a.professional_id AND a.start_time BETWEEN ${startDate} AND ${endDate}
        GROUP BY p.id, u.full_name
        ORDER BY count DESC
      `,

      // Citas completadas
      this.prisma.appointment.count({
        where: { ...whereClause, status: 'COMPLETED' },
      }),

      // Citas canceladas
      this.prisma.appointment.count({
        where: { ...whereClause, status: 'CANCELLED' },
      }),

      // Top 10 mascotas más atendidas
      this.prisma.$queryRaw<
        Array<{
          pet_id: string;
          pet_name: string;
          appointment_count: number;
        }>
      >`
        SELECT p.id as pet_id, p.name as pet_name, COUNT(a.id) as appointment_count
        FROM pets p
        JOIN appointments a ON p.id = a.pet_id AND a.start_time BETWEEN ${startDate} AND ${endDate}
        GROUP BY p.id, p.name
        ORDER BY appointment_count DESC
        LIMIT 10
      `,

      // Top 10 clientes más activos
      this.prisma.$queryRaw<
        Array<{
          client_id: string;
          client_name: string;
          appointment_count: number;
        }>
      >`
        SELECT u.id as client_id, u.full_name as client_name, COUNT(a.id) as appointment_count
        FROM users u
        JOIN appointments a ON u.id = a.client_id AND a.start_time BETWEEN ${startDate} AND ${endDate}
        GROUP BY u.id, u.full_name
        ORDER BY appointment_count DESC
        LIMIT 10
      `,
    ]);

    const cancellationRate =
      totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    return {
      totalAppointments,
      appointmentsByStatus: appointmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      appointmentsTrend: appointmentsTrend.map((item) => ({
        date: item.date,
        count: Number(item.count),
      })),
      appointmentsByClinic: appointmentsByClinic.map((item) => ({
        clinicId: item.clinic_id,
        clinicName: item.clinic_name,
        count: item.count,
      })),
      appointmentsByProfessional: appointmentsByProfessional.map((item) => ({
        professionalId: item.professional_id,
        professionalName: item.professional_name,
        count: item.count,
      })),
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      topPetsWithAppointments: topPetsWithAppointments.map((item) => ({
        petId: item.pet_id,
        petName: item.pet_name,
        appointmentCount: item.appointment_count,
      })),
      topClientsWithAppointments: topClientsWithAppointments.map((item) => ({
        clientId: item.client_id,
        clientName: item.client_name,
        appointmentCount: item.appointment_count,
      })),
    };
  }

  // ============================================================
  // MÉTRICAS DE CLÍNICAS
  // ============================================================

  async getClinicMetrics(filters: AnalyticsFiltersDto): Promise<ClinicMetricsDto> {
    const [
      totalClinics,
      verifiedClinics,
      unverifiedClinics,
      clinicsByOwner,
      totalBranches,
      branchesByCity,
      branchesByClinic,
    ] = await Promise.all([
      // Total clínicas
      this.prisma.clinic.count(),

      // Clínicas verificadas
      this.prisma.clinic.count({ where: { isVerified: true } }),

      // Clínicas no verificadas
      this.prisma.clinic.count({ where: { isVerified: false } }),

      // Clínicas por propietario
      this.prisma.$queryRaw<
        Array<{
          owner_id: string;
          owner_name: string;
          clinic_count: number;
        }>
      >`
        SELECT u.id as owner_id, u.full_name as owner_name, COUNT(c.id) as clinic_count
        FROM users u
        JOIN clinics c ON u.id = c.owner_user_id
        GROUP BY u.id, u.full_name
        ORDER BY clinic_count DESC
      `,

      // Total sucursales
      this.prisma.branch.count(),

      // Sucursales por ciudad
      this.prisma.branch.groupBy({
        by: ['city'],
        _count: true,
      }),

      // Sucursales por clínica
      this.prisma.$queryRaw<
        Array<{
          clinic_id: string;
          clinic_name: string;
          branch_count: number;
        }>
      >`
        SELECT c.id as clinic_id, c.name as clinic_name, COUNT(b.id) as branch_count
        FROM clinics c
        LEFT JOIN branches b ON c.id = b.clinic_id
        GROUP BY c.id, c.name
        ORDER BY branch_count DESC
      `,
    ]);

    return {
      totalClinics,
      verifiedClinics,
      unverifiedClinics,
      clinicsByOwner: clinicsByOwner.map((item) => ({
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        clinicCount: item.clinic_count,
      })),
      totalBranches,
      branchesByCity: branchesByCity.map((item) => ({
        city: item.city,
        count: item._count,
      })),
      branchesByClinic: branchesByClinic.map((item) => ({
        clinicId: item.clinic_id,
        clinicName: item.clinic_name,
        branchCount: item.branch_count,
      })),
    };
  }

  // ============================================================
  // MÉTRICAS DE PROFESIONALES
  // ============================================================

  async getProfessionalMetrics(filters: AnalyticsFiltersDto): Promise<ProfessionalMetricsDto> {
    const [
      totalProfessionals,
      activeProfessionals,
      inactiveProfessionals,
      professionalsBySpecialty,
      professionalsByBranch,
    ] = await Promise.all([
      // Total profesionales
      this.prisma.professional.count(),

      // Profesionales activos
      this.prisma.professional.count({ where: { isActive: true } }),

      // Profesionales inactivos
      this.prisma.professional.count({ where: { isActive: false } }),

      // Profesionales por especialidad
      this.prisma.professional.groupBy({
        by: ['specialty'],
        _count: true,
      }),

      // Profesionales por sucursal
      this.prisma.$queryRaw<
        Array<{
          branch_id: string;
          branch_name: string;
          count: number;
        }>
      >`
        SELECT b.id as branch_id, b.name as branch_name, COUNT(p.id) as count
        FROM branches b
        LEFT JOIN professionals p ON b.id = p.branch_id
        GROUP BY b.id, b.name
        ORDER BY count DESC
      `,
    ]);

    return {
      totalProfessionals,
      activeProfessionals,
      inactiveProfessionals,
      professionalsBySpecialty: professionalsBySpecialty.map((item) => ({
        specialty: item.specialty,
        count: item._count,
      })),
      professionalsByBranch: professionalsByBranch.map((item) => ({
        branchId: item.branch_id,
        branchName: item.branch_name,
        count: item.count,
      })),
    };
  }

  // ============================================================
  // MÉTRICAS DE SERVICIOS
  // ============================================================

  async getServiceMetrics(filters: AnalyticsFiltersDto): Promise<ServiceMetricsDto> {
    const { startDate, endDate } = this.getDateRange(filters);

    const [
      totalServices,
      activeServices,
      servicesByCategory,
      averagePriceByCategory,
      mostBookedServices,
    ] = await Promise.all([
      // Total servicios
      this.prisma.veterinaryService.count(),

      // Servicios activos
      this.prisma.veterinaryService.count({ where: { isActive: true } }),

      // Servicios por categoría
      this.prisma.veterinaryService.groupBy({
        by: ['category'],
        _count: true,
      }),

      // Precio promedio por categoría
      this.prisma.$queryRaw<Array<{ category: string; avg_price: number }>>`
        SELECT category, AVG(price) as avg_price
        FROM veterinary_services
        GROUP BY category
      `,

      // Top servicios más contratados
      this.prisma.$queryRaw<
        Array<{
          service_id: string;
          service_name: string;
          booking_count: number;
        }>
      >`
        SELECT vs.id as service_id, vs.name as service_name, COUNT(a.id) as booking_count
        FROM veterinary_services vs
        LEFT JOIN appointments a ON vs.id = a.service_id AND a.start_time BETWEEN ${startDate} AND ${endDate}
        GROUP BY vs.id, vs.name
        ORDER BY booking_count DESC
        LIMIT 10
      `,
    ]);

    return {
      totalServices,
      activeServices,
      servicesByCategory: servicesByCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      averagePriceByCategory: averagePriceByCategory.map((item) => ({
        category: item.category,
        averagePrice: Number(item.avg_price),
      })),
      mostBookedServices: mostBookedServices.map((item) => ({
        serviceId: item.service_id,
        serviceName: item.service_name,
        bookingCount: item.booking_count,
      })),
    };
  }

  // ============================================================
  // MÉTRICAS MÉDICAS
  // ============================================================

  async getMedicalMetrics(filters: AnalyticsFiltersDto): Promise<MedicalMetricsDto> {
    const [
      totalMedicalRecords,
      totalVaccines,
      vaccinesToExpireSoon,
      totalMedications,
      activeMedications,
      completedMedications,
    ] = await Promise.all([
      // Total registros médicos
      this.prisma.medicalHistory.count(),

      // Total vacunas
      this.prisma.vaccine.count(),

      // Vacunas próximas a vencer (próximos 30 días)
      this.prisma.vaccine.count({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gt: new Date(),
          },
        },
      }),

      // Total medicamentos
      this.prisma.medication.count(),

      // Medicamentos activos
      this.prisma.medication.count({
        where: { status: 'ACTIVE' },
      }),

      // Medicamentos completados
      this.prisma.medication.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalMedicalRecords,
      totalVaccines,
      vaccinesToExpireSoon,
      totalMedications,
      activeMedications,
      completedMedications,
    };
  }

  // ============================================================
  // MÉTRICAS DE NOTIFICACIONES
  // ============================================================

  async getNotificationMetrics(filters: AnalyticsFiltersDto): Promise<NotificationMetricsDto> {
    const [totalNotifications, notificationsByType, readNotifications, unreadNotifications] =
      await Promise.all([
        // Total notificaciones
        this.prisma.notification.count(),

        // Notificaciones por tipo
        this.prisma.notification.groupBy({
          by: ['type'],
          _count: true,
        }),

        // Notificaciones leídas
        this.prisma.notification.count({
          where: { read: true },
        }),

        // Notificaciones no leídas
        this.prisma.notification.count({
          where: { read: false },
        }),
      ]);

    const readRate = totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;

    return {
      totalNotifications,
      notificationsByType: notificationsByType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
      readNotifications,
      unreadNotifications,
      readRate: Math.round(readRate * 100) / 100,
    };
  }
}
