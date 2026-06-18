import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
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
      console.log('[createAppointment] Request:', {
        clientId: req.user.sub,
        clinicId: dto.clinicId,
        petId: dto.petId,
        service: dto.service,
        date: dto.date,
        time: dto.time,
        notes: dto.notes,
      });

      // Parse date and time into ISO string
      const [hours, minutes] = dto.time.split(':').map(Number);
      const appointmentDate = new Date(`${dto.date}T00:00:00Z`);
      appointmentDate.setHours(hours, minutes);

      const appointment = await this.appointmentsService.createAppointment({
        clientId: req.user.sub,
        petId: dto.petId,
        clinicId: dto.clinicId,
        service: dto.service,
        startTime: appointmentDate,
        notes: dto.notes,
      });

      console.log('[createAppointment] Success:', appointment.id);
      return appointment;
    } catch (error) {
      console.error('[createAppointment] Error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAppointments(@Request() req: any): Promise<AppointmentResponseDto[]> {
    try {
      return await this.appointmentsService.getAppointmentsByClient(req.user.sub);
    } catch (error) {
      console.error('[getAppointments] Error:', error);
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
      return appointment;
    } catch (error) {
      console.error('[getAppointment] Error:', error);
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
      );
    } catch (error) {
      console.error('[cancelAppointment] Error:', error);
      throw error;
    }
  }
}
