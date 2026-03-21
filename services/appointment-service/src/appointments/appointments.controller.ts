import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
import { JwtAccessGuard } from "../jwt-access.guard";
import { Roles } from "../roles.decorator";
import { RolesGuard } from "../roles.guard";
import { AuthenticatedRequest } from "../auth-context";
import { APPOINTMENT_ROUTE_ROLE_POLICY } from "@petquotes/contracts";

@Controller("appointments")
@UseGuards(JwtAccessGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(...APPOINTMENT_ROUTE_ROLE_POLICY.createAppointment)
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto, request.user, request.headers["x-idempotency-key"]);
  }

  @Get("pet/:petId")
  @Roles(...APPOINTMENT_ROUTE_ROLE_POLICY.listAppointmentsByPet)
  findByPet(@Req() request: AuthenticatedRequest, @Param("petId") petId: string) {
    return this.appointmentsService.findByPet(petId, request.user);
  }

  @Patch(":id/status")
  @Roles(...APPOINTMENT_ROUTE_ROLE_POLICY.updateAppointmentStatus)
  updateStatus(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto.status, request.user);
  }

  @Patch(":id/reschedule")
  @Roles(...APPOINTMENT_ROUTE_ROLE_POLICY.rescheduleAppointment)
  reschedule(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() dto: RescheduleAppointmentDto) {
    return this.appointmentsService.reschedule(id, dto.startsAt, request.user);
  }
}
