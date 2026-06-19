import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from '@business/analytics/analytics.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { CurrentUser } from '@shared/decorators';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtPayload } from '@shared/types';
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
} from './analytics.dto';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * GET /api/analytics/dashboard
   * Obtener todos los KPIs y datos para el dashboard principal
   */
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DashboardResponseDto> {
    return this.analyticsService.getDashboard(filters);
  }

  /**
   * GET /api/analytics/users
   * Métricas detalladas de usuarios
   */
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUserMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserMetricsDto> {
    return this.analyticsService.getUserMetrics(filters);
  }

  /**
   * GET /api/analytics/pets
   * Métricas detalladas de mascotas
   */
  @Get('pets')
  @HttpCode(HttpStatus.OK)
  async getPetMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PetMetricsDto> {
    return this.analyticsService.getPetMetrics(filters);
  }

  /**
   * GET /api/analytics/appointments
   * Métricas detalladas de citas
   */
  @Get('appointments')
  @HttpCode(HttpStatus.OK)
  async getAppointmentMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AppointmentMetricsDto> {
    return this.analyticsService.getAppointmentMetrics(filters);
  }

  /**
   * GET /api/analytics/clinics
   * Métricas detalladas de clínicas
   */
  @Get('clinics')
  @HttpCode(HttpStatus.OK)
  async getClinicMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ClinicMetricsDto> {
    return this.analyticsService.getClinicMetrics(filters);
  }

  /**
   * GET /api/analytics/professionals
   * Métricas detalladas de profesionales
   */
  @Get('professionals')
  @HttpCode(HttpStatus.OK)
  async getProfessionalMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProfessionalMetricsDto> {
    return this.analyticsService.getProfessionalMetrics(filters);
  }

  /**
   * GET /api/analytics/services
   * Métricas detalladas de servicios
   */
  @Get('services')
  @HttpCode(HttpStatus.OK)
  async getServiceMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ServiceMetricsDto> {
    return this.analyticsService.getServiceMetrics(filters);
  }

  /**
   * GET /api/analytics/medical
   * Métricas de historial médico, vacunas y medicamentos
   */
  @Get('medical')
  @HttpCode(HttpStatus.OK)
  async getMedicalMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<MedicalMetricsDto> {
    return this.analyticsService.getMedicalMetrics(filters);
  }

  /**
   * GET /api/analytics/notifications
   * Métricas de notificaciones
   */
  @Get('notifications')
  @HttpCode(HttpStatus.OK)
  async getNotificationMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationMetricsDto> {
    return this.analyticsService.getNotificationMetrics(filters);
  }
}
