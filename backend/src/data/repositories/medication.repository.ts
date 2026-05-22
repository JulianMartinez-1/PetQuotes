import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Medication } from '@prisma/client';

@Injectable()
export class MedicationRepository {
  constructor(private prisma: PrismaService) {}

  async findByPetId(petId: string, status?: string): Promise<Medication[]> {
    return this.prisma.medication.findMany({
      where: {
        petId,
        ...(status && { status }),
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string): Promise<Medication | null> {
    return this.prisma.medication.findUnique({
      where: { id },
    });
  }

  async create(petId: string, data: {
    name: string;
    dosage: string;
    frequency: string;
    reason?: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy?: string;
    clinic?: string;
    side_effects?: string;
    notes?: string;
  }): Promise<Medication> {
    return this.prisma.medication.create({
      data: {
        petId,
        ...data,
      },
    });
  }

  async update(id: string, data: Partial<Medication>): Promise<Medication> {
    return this.prisma.medication.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Medication> {
    return this.prisma.medication.delete({
      where: { id },
    });
  }

  async findActiveMedications(petId: string): Promise<Medication[]> {
    const today = new Date();
    
    return this.prisma.medication.findMany({
      where: {
        petId,
        status: 'ACTIVE',
        startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } },
        ],
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findMedicationHistory(petId: string): Promise<Medication[]> {
    return this.prisma.medication.findMany({
      where: { petId },
      orderBy: { startDate: 'desc' },
    });
  }
}
