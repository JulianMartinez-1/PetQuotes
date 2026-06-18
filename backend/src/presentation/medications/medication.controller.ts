import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { MedicationService } from '@business/medications/medication.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';

@Controller('pets/:petId/medications')
@UseGuards(JwtAuthGuard)
export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  @Get()
  async listMedications(
    @Param('petId') petId: string,
    @Query('status') status?: string,
  ) {
    if (status === 'active') {
      return this.medicationService.getActiveMedications(petId);
    }
    return this.medicationService.listMedicationsByPet(petId);
  }

  @Get('history')
  async getMedicationHistory(@Param('petId') petId: string) {
    return this.medicationService.getMedicationHistory(petId);
  }

  @Get(':id')
  async getMedication(@Param('id') id: string) {
    return this.medicationService.getMedicationById(id);
  }

  @Post()
  async createMedication(
    @Param('petId') petId: string,
    @Body() data: {
      name: string;
      dosage: string;
      frequency: string;
      reason?: string;
      startDate: string;
      endDate?: string;
      prescribedBy?: string;
      clinic?: string;
      side_effects?: string;
      notes?: string;
    },
  ) {
    return this.medicationService.createMedication(petId, {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
  }

  @Patch(':id')
  async updateMedication(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.medicationService.updateMedication(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteMedication(@Param('id') id: string) {
    await this.medicationService.deleteMedication(id);
  }
}
