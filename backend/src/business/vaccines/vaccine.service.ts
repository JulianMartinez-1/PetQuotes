import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { VaccineRepository } from '@data/repositories/vaccine.repository';

export interface VaccineDto {
  id: string;
  petId: string;
  name: string;
  dateAdministered: Date;
  expiryDate: Date | null;
  nextDueDate: Date | null;
  veterinarian?: string;
  clinic?: string;
  batch?: string;
  notes?: string;
  status: 'CURRENT' | 'EXPIRED' | 'PENDING';
}

@Injectable()
export class VaccineService {
  constructor(private vaccineRepository: VaccineRepository) {}

  async listVaccinesByPet(petId: string): Promise<VaccineDto[]> {
    const vaccines = await this.vaccineRepository.findByPetId(petId);
    return vaccines.map(v => this.mapVaccineStatus(v));
  }

  async getVaccineById(id: string): Promise<VaccineDto> {
    const vaccine = await this.vaccineRepository.findById(id);
    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }
    return this.mapVaccineStatus(vaccine);
  }

  async createVaccine(petId: string, data: {
    name: string;
    dateAdministered: Date;
    expiryDate?: Date;
    nextDueDate?: Date;
    veterinarian?: string;
    clinic?: string;
    batch?: string;
    notes?: string;
  }): Promise<VaccineDto> {
    const vaccine = await this.vaccineRepository.create(petId, data);
    return this.mapVaccineStatus(vaccine);
  }

  async updateVaccine(id: string, data: any): Promise<VaccineDto> {
    const vaccine = await this.vaccineRepository.update(id, data);
    return this.mapVaccineStatus(vaccine);
  }

  async deleteVaccine(id: string): Promise<void> {
    await this.vaccineRepository.delete(id);
  }

  async getUpcomingVaccines(petId: string): Promise<VaccineDto[]> {
    const vaccines = await this.vaccineRepository.findUpcomingVaccines(petId);
    return vaccines.map(v => this.mapVaccineStatus(v));
  }

  async getExpiredVaccines(petId: string): Promise<VaccineDto[]> {
    const vaccines = await this.vaccineRepository.findExpiredVaccines(petId);
    return vaccines.map(v => this.mapVaccineStatus(v));
  }

  private mapVaccineStatus(vaccine: any): VaccineDto {
    const now = new Date();
    let status: 'CURRENT' | 'EXPIRED' | 'PENDING' = 'PENDING';

    if (vaccine.expiryDate && vaccine.expiryDate < now) {
      status = 'EXPIRED';
    } else if (vaccine.expiryDate && vaccine.expiryDate > now) {
      status = 'CURRENT';
    }

    return {
      id: vaccine.id,
      petId: vaccine.petId,
      name: vaccine.name,
      dateAdministered: vaccine.dateAdministered,
      expiryDate: vaccine.expiryDate,
      nextDueDate: vaccine.nextDueDate,
      veterinarian: vaccine.veterinarian,
      clinic: vaccine.clinic,
      batch: vaccine.batch,
      notes: vaccine.notes,
      status,
    };
  }
}
