import { Injectable, NotFoundException } from '@nestjs/common';
import { MedicationRepository } from '@data/repositories/medication.repository';

export interface MedicationDto {
  id: string;
  petId: string;
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
  status: string;
  isActive: boolean;
  daysRemaining?: number;
}

@Injectable()
export class MedicationService {
  constructor(private medicationRepository: MedicationRepository) {}

  async listMedicationsByPet(petId: string): Promise<MedicationDto[]> {
    const medications = await this.medicationRepository.findByPetId(petId);
    return medications.map(m => this.mapMedicationDto(m));
  }

  async getMedicationById(id: string): Promise<MedicationDto> {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
    return this.mapMedicationDto(medication);
  }

  async createMedication(petId: string, data: {
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
  }): Promise<MedicationDto> {
    const medication = await this.medicationRepository.create(petId, data);
    return this.mapMedicationDto(medication);
  }

  async updateMedication(id: string, data: any): Promise<MedicationDto> {
    const medication = await this.medicationRepository.update(id, data);
    return this.mapMedicationDto(medication);
  }

  async deleteMedication(id: string): Promise<void> {
    await this.medicationRepository.delete(id);
  }

  async getActiveMedications(petId: string): Promise<MedicationDto[]> {
    const medications = await this.medicationRepository.findActiveMedications(petId);
    return medications.map(m => this.mapMedicationDto(m));
  }

  async getMedicationHistory(petId: string): Promise<MedicationDto[]> {
    const medications = await this.medicationRepository.findMedicationHistory(petId);
    return medications.map(m => this.mapMedicationDto(m));
  }

  private mapMedicationDto(medication: any): MedicationDto {
    const now = new Date();
    const isActive = medication.status === 'ACTIVE' && 
                     medication.startDate <= now &&
                     (!medication.endDate || medication.endDate >= now);
    
    let daysRemaining: number | undefined;
    if (medication.endDate) {
      daysRemaining = Math.ceil((medication.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      id: medication.id,
      petId: medication.petId,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      reason: medication.reason,
      startDate: medication.startDate,
      endDate: medication.endDate,
      prescribedBy: medication.prescribedBy,
      clinic: medication.clinic,
      side_effects: medication.side_effects,
      notes: medication.notes,
      status: medication.status,
      isActive,
      daysRemaining,
    };
  }
}
