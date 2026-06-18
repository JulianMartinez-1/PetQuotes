import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateAppointmentInput {
  clientId: string;
  petId: string;
  clinicId: string;
  service: string;
  startTime: Date;
  notes?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAppointment(input: CreateAppointmentInput) {
  // Get clinic with branches and professionals
  const clinic = await this.prisma.clinic.findUnique({
    where: { id: input.clinicId },
    include: {
      branches: {
        include: {
          professionals: true,
        },
      },
      services: true,
    },
  });

  if (!clinic) {
    throw new Error(`Clinic with ID ${input.clinicId} not found`);
  }

  if (!clinic.branches || clinic.branches.length === 0) {
    throw new Error('Clinic has no branches');
  }

  // Get first branch (main branch)
  const branch = clinic.branches[0];

  // Find professional in the branch
  let professional = branch.professionals?.[0];
  if (!professional) {
    throw new Error('No available professionals in this clinic');
  }

  // Find service by name from clinic services
  let serviceRecord = clinic.services?.find(
    (s) => s.name.toLowerCase() === input.service.toLowerCase(),
  );

  if (!serviceRecord) {
    // If exact match not found, create a service
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
    where: {
      id: input.petId,
      ownerId: input.clientId,
    },
  });

  if (!pet) {
    throw new Error('Pet not found or does not belong to client');
  }

  // Calculate end time (assuming 30 minutes appointment)
  const endTime = new Date(input.startTime);
  endTime.setMinutes(endTime.getMinutes() + 30);

  // Create appointment
  const appointment = await this.prisma.appointment.create({
    data: {
      clientId: input.clientId,
      petId: input.petId,
      professionalId: professional.id,
      serviceId: serviceRecord.id,
      branchId: branch.id,
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
