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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PetsService } from '@business/pets/pets.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@shared/types';
import { CreatePetDto, UpdatePetDto, PetResponseDto } from './pets.dto';
import { PaginationDto } from '@shared/dto/common.dto';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

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
  @UseInterceptors(FileInterceptor('profileImage'))
  @HttpCode(HttpStatus.CREATED)
  async createPet(
    @Body() dto: CreatePetDto,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<PetResponseDto> {
    // Convert file to base64 if provided
    let profileImage: string | undefined;
    if (file) {
      profileImage = file.buffer.toString('base64');
    }

    return this.petsService.createPet(user.sub, {
      ownerId: user.sub,
      name: dto.name,
      species: dto.species,
      breed: dto.breed,
      age: dto.age,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weight: dto.weight ? parseFloat(String(dto.weight)) : undefined,
      microchip: dto.microchip,
      vaccinesUpToDate: dto.vaccinesUpToDate,
      bloodType: dto.bloodType,
      notes: dto.notes,
      profileImage,
    });
  }

  /**
   * Update pet
   * PATCH /api/pets/:id
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
  @HttpCode(HttpStatus.OK)
  async updatePet(
    @Param('id') petId: string,
    @Body() dto: UpdatePetDto,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<PetResponseDto> {
    // Convert file to base64 if provided
    let profileImage: string | undefined;
    if (file) {
      profileImage = file.buffer.toString('base64');
    }

    return this.petsService.updatePet(petId, user.sub, {
      name: dto.name,
      breed: dto.breed,
      age: dto.age,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weight: dto.weight ? parseFloat(String(dto.weight)) : undefined,
      vaccinesUpToDate: dto.vaccinesUpToDate,
      bloodType: dto.bloodType,
      notes: dto.notes,
      profileImage,
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
