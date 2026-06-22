import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { NotificationService } from '@/business/notifications/notification.service';

export interface CreateAppointmentInput {
  clientId: string;
  petId: string;
  clinicId: string;
  clinicName?: string;
  service: string;
  startTime: Date;
  notes?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createAppointment(input: CreateAppointmentInput) {
    // Find or create clinic (clinic IDs come from Google Places, not Prisma)
    let clinic = await this.prisma.clinic.findUnique({
      where: { id: input.clinicId },
      include: { branches: { include: { professionals: true } }, services: true },
    });

    if (!clinic) {
      clinic = await this.prisma.clinic.create({
        data: {
          id: input.clinicId,
          name: input.clinicName ?? 'Clínica Veterinaria',
          ownerUserId: input.clientId,
        },
        include: { branches: { include: { professionals: true } }, services: true },
      });
    }

    // Resolve optional branch and professional (may not exist for all clinics)
    const branch = clinic.branches?.[0] ?? null;
    const professional = branch?.professionals?.[0] ?? null;

    // Find or create service record
    let serviceRecord = clinic.services?.find(
      (s) => s.name.toLowerCase() === input.service.toLowerCase(),
    );

    if (!serviceRecord) {
      serviceRecord = await this.prisma.veterinaryService.create({
        data: {
          name: input.service,
          description: `Service: ${input.service}`,
          price: 0,
          duration: 30,
          category: 'consultation',
          clinicId: input.clinicId,
        },
      });
    }

    // Verify pet belongs to client
    const pet = await this.prisma.pet.findFirst({
      where: { id: input.petId, ownerId: input.clientId },
    });

    if (!pet) {
      throw new Error('Pet not found or does not belong to client');
    }

    // Calculate end time (30-minute slot)
    const endTime = new Date(input.startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: input.clientId,
        petId: input.petId,
        professionalId: professional?.id ?? null,
        serviceId: serviceRecord.id,
        branchId: branch?.id ?? null,
        clinicId: input.clinicId,
        startTime: input.startTime,
        endTime,
        notes: input.notes,
        status: 'PENDING',
      },
    });

    return appointment;
  }

  async getAppointmentsByClient(clientId: string) {
    return this.prisma.appointment.findMany({
      where: { clientId },
      include: {
        pet: true,
        professional: true,
        service: true,
        clinic: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: {
        pet: true,
        service: true,
        clinic: true,
        client: { select: { id: true, fullName: true, email: true, phone: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async confirmAppointment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const confirmed = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
      include: {
        pet: true,
        service: true,
        clinic: true,
        client: {
          select: { id: true, fullName: true, email: true, phone: true, notificationChannel: true },
        },
      },
    });

    // Fire notification without blocking or failing the confirmation
    if (confirmed.client?.notificationChannel === 'EMAIL' && confirmed.client.email) {
      void this.notificationService.sendAppointmentConfirmation({
        to: confirmed.client.email,
        clientName: confirmed.client.fullName,
        clinicName: confirmed.clinic.name,
        petName: confirmed.pet?.name ?? 'tu mascota',
        service: confirmed.service.name,
        startTime: confirmed.startTime,
      });
    }

    return confirmed;
  }

  async getAppointmentById(appointmentId: string) {
    return this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: true,
        professional: true,
        service: true,
        clinic: true,
      },
    });
  }

  async cancelAppointment(appointmentId: string, clientId: string, cancellationReason?: string) {
    // Verify ownership
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clientId,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found or does not belong to client');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        cancellationReason,
      },
    });
  }
}
