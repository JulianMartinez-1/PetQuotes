import {
  Controller,
  Get,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  InternalServerErrorException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { AnalyticsFiltersDto } from './analytics.dto';

/**
 * Proxy controller.
 * Auth: JwtAuthGuard + RolesGuard(ADMIN) is the first security layer.
 * The Python analytics service validates the JWT independently as a second layer.
 */
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  private readonly analyticsUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.analyticsUrl =
      this.configService.get<string>('ANALYTICS_SERVICE_URL') ||
      'http://analytics-service:3009';
    this.logger.log(`Analytics URL: ${this.analyticsUrl}`);
  }

  private async proxy(path: string, params: Record<string, any>, auth: string) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    const targetUrl = `${this.analyticsUrl}/analytics/${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService
          .get(targetUrl, {
            params: cleanParams,
            headers: { Authorization: auth },
          })
          .pipe(
            timeout(15000),
            catchError((err: AxiosError) => {
              this.logger.error(
                `Analytics proxy error [${path}]: code=${err.code} status=${err.response?.status} msg=${err.message}`,
              );
              if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
                throw new ServiceUnavailableException(
                  'El servicio de analítica no está disponible',
                );
              }
              throw err;
            }),
          ),
      );
      return response.data;
    } catch (err: any) {
      if (err?.status) throw err;
      this.logger.error(`Analytics outer catch [${path}]: ${err?.constructor?.name} ${err?.message}`);
      throw new InternalServerErrorException(
        `Error al consultar el servicio de analítica: ${err?.message ?? 'unknown'}`,
      );
    }
  }

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getSummary(
    @Query() filters: AnalyticsFiltersDto,
    @Headers('authorization') auth: string,
  ) {
    return this.proxy('summary', { start_date: filters.startDate, end_date: filters.endDate }, auth);
  }

  // /dashboard is the name the frontend hook uses
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @Query() filters: AnalyticsFiltersDto,
    @Headers('authorization') auth: string,
  ) {
    this.logger.log(`getDashboard called, auth present: ${!!auth}`);
    return this.proxy('summary', { start_date: filters.startDate, end_date: filters.endDate }, auth);
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUserMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @Headers('authorization') auth: string,
  ) {
    return this.proxy('users', {}, auth);
  }

  @Get('appointments')
  @HttpCode(HttpStatus.OK)
  async getAppointmentMetrics(
    @Query() filters: AnalyticsFiltersDto,
    @Headers('authorization') auth: string,
  ) {
    return this.proxy('appointments', {
      start_date: filters.startDate,
      end_date: filters.endDate,
      clinic_id: filters.clinicId,
    }, auth);
  }

  @Get('pets')
  @HttpCode(HttpStatus.OK)
  async getPetMetrics(@Headers('authorization') auth: string) {
    return this.proxy('pets', {}, auth);
  }

  @Get('clinics')
  @HttpCode(HttpStatus.OK)
  async getClinicMetrics(@Headers('authorization') auth: string) {
    return this.proxy('clinics', {}, auth);
  }

  @Get('professionals')
  @HttpCode(HttpStatus.OK)
  async getProfessionalMetrics(@Headers('authorization') auth: string) {
    return this.proxy('professionals', {}, auth);
  }
}
