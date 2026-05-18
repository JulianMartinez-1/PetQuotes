import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PetsService } from '@business/pets/pets.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@shared/types';
import { CreatePetDto, UpdatePetDto, PetResponseDto } from './pets.dto';
import { PaginationDto } from '@shared/dto/common.dto';

@Controller('api/pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private petsService: PetsService) {}

  /**
   * List all pets of current user
   * GET /api/pets
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async listMyPets(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: PaginationDto,
  ) {
    return this.petsService.listMyPets(user.sub, pagination.page, pagination.limit);
  }

  /**
   * Get pet by ID
   * GET /api/pets/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPet(
    @Param('id') petId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PetResponseDto> {
    return this.petsService.getPetById(petId, user.sub);
  }

  /**
   * Create a new pet
   * POST /api/pets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPet(
    @Body() dto: CreatePetDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PetResponseDto> {
    return this.petsService.createPet(user.sub, {
      ownerId: user.sub,
      name: dto.name,
      species: dto.species,
      breed: dto.breed,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weight: dto.weight,
      microchip: dto.microchip,
      vaccinesUpToDate: dto.vaccinesUpToDate,
      bloodType: dto.bloodType,
      notes: dto.notes,
    });
  }

  /**
   * Update pet
   * PATCH /api/pets/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updatePet(
    @Param('id') petId: string,
    @Body() dto: UpdatePetDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PetResponseDto> {
    return this.petsService.updatePet(petId, user.sub, {
      name: dto.name,
      breed: dto.breed,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weight: dto.weight,
      vaccinesUpToDate: dto.vaccinesUpToDate,
      bloodType: dto.bloodType,
      notes: dto.notes,
    });
  }

  /**
   * Delete pet
   * DELETE /api/pets/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePet(
    @Param('id') petId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.petsService.deletePet(petId, user.sub);
    return {
      message: 'Pet deleted successfully',
    };
  }
}
