import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { VaccineService } from '@business/vaccines/vaccine.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';

@Controller('api/pets/:petId/vaccines')
@UseGuards(JwtAuthGuard)
export class VaccineController {
  constructor(private vaccineService: VaccineService) {}

  @Get()
  async listVaccines(@Param('petId') petId: string) {
    return this.vaccineService.listVaccinesByPet(petId);
  }

  @Get('upcoming')
  async getUpcomingVaccines(@Param('petId') petId: string) {
    return this.vaccineService.getUpcomingVaccines(petId);
  }

  @Get('expired')
  async getExpiredVaccines(@Param('petId') petId: string) {
    return this.vaccineService.getExpiredVaccines(petId);
  }

  @Get(':id')
  async getVaccine(@Param('id') id: string) {
    return this.vaccineService.getVaccineById(id);
  }

  @Post()
  async createVaccine(
    @Param('petId') petId: string,
    @Body() data: {
      name: string;
      dateAdministered: string;
      expiryDate?: string;
      nextDueDate?: string;
      veterinarian?: string;
      clinic?: string;
      batch?: string;
      notes?: string;
    },
  ) {
    return this.vaccineService.createVaccine(petId, {
      ...data,
      dateAdministered: new Date(data.dateAdministered),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
    });
  }

  @Patch(':id')
  async updateVaccine(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.vaccineService.updateVaccine(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteVaccine(@Param('id') id: string) {
    await this.vaccineService.deleteVaccine(id);
  }
}
