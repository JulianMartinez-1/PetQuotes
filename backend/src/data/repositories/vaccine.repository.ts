import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Vaccine } from '@prisma/client';

@Injectable()
export class VaccineRepository {
  constructor(private prisma: PrismaService) {}

  async findByPetId(petId: string): Promise<Vaccine[]> {
    return this.prisma.vaccine.findMany({
      where: { petId },
      orderBy: { dateAdministered: 'desc' },
    });
  }

  async findById(id: string): Promise<Vaccine | null> {
    return this.prisma.vaccine.findUnique({
      where: { id },
    });
  }

  async create(petId: string, data: {
    name: string;
    dateAdministered: Date;
    expiryDate?: Date;
    nextDueDate?: Date;
    veterinarian?: string;
    clinic?: string;
    batch?: string;
    notes?: string;
  }): Promise<Vaccine> {
    return this.prisma.vaccine.create({
      data: {
        petId,
        ...data,
      },
    });
  }

  async update(id: string, data: Partial<Vaccine>): Promise<Vaccine> {
    return this.prisma.vaccine.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Vaccine> {
    return this.prisma.vaccine.delete({
      where: { id },
    });
  }

  async findUpcomingVaccines(petId: string, daysAhead: number = 30): Promise<Vaccine[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return this.prisma.vaccine.findMany({
      where: {
        petId,
        nextDueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  async findExpiredVaccines(petId: string): Promise<Vaccine[]> {
    return this.prisma.vaccine.findMany({
      where: {
        petId,
        expiryDate: {
          lt: new Date(),
        },
      },
      orderBy: { expiryDate: 'desc' },
    });
  }
}
