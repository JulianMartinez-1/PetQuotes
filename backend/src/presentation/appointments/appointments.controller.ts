import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request, HttpStatus, HttpCode, HttpException } from '@nestjs/common';
import { AppointmentsService } from '@/business/appointments/appointments.service';
import { CreateAppointmentDto, AppointmentResponseDto } from './appointments.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAppointment(
    @Request() req: any,
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    try {
      // Parse date and time into ISO string
      const [hours, minutes] = dto.time.split(':').map(Number);
      const appointmentDate = new Date(`${dto.date}T00:00:00Z`);
      appointmentDate.setHours(hours, minutes);

      const appointment = await this.appointmentsService.createAppointment({
        clientId: req.user.sub,
        petId: dto.petId,
        clinicId: dto.clinicId,
        clinicName: dto.clinicName,
        service: dto.service,
        startTime: appointmentDate,
        notes: dto.notes,
      });

      return appointment as AppointmentResponseDto;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ── Admin endpoints (must come before :id routes) ────────────

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllAppointments(@Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    try {
      return await this.appointmentsService.getAllAppointments();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/confirm')
  async confirmAppointment(@Request() req: any, @Param('id') appointmentId: string) {
    if (req.user.role !== 'ADMIN') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    try {
      return await this.appointmentsService.confirmAppointment(appointmentId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ── Client endpoints ─────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAppointments(@Request() req: any): Promise<AppointmentResponseDto[]> {
    try {
      return await this.appointmentsService.getAppointmentsByClient(req.user.sub) as AppointmentResponseDto[];
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAppointment(
    @Request() req: any,
    @Param('id') appointmentId: string,
  ): Promise<AppointmentResponseDto> {
    try {
      const appointment = await this.appointmentsService.getAppointmentById(appointmentId);
      if (!appointment || appointment.clientId !== req.user.sub) {
        throw new Error('Appointment not found');
      }
      return appointment as AppointmentResponseDto;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancelAppointment(
    @Request() req: any,
    @Param('id') appointmentId: string,
    @Body('cancellationReason') cancellationReason?: string,
  ): Promise<AppointmentResponseDto> {
    try {
      return await this.appointmentsService.cancelAppointment(
        appointmentId,
        req.user.sub,
        cancellationReason,
      ) as AppointmentResponseDto;
    } catch (error) {
      throw error;
    }
  }
}
