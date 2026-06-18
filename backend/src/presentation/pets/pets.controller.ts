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

@Controller('pets')
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
    console.log("[createPet] Received DTO:", JSON.stringify(dto, null, 2));
    console.log("[createPet] File present:", !!file, "Size:", file?.size);
    console.log("[createPet] Current user:", user.sub);
    
    // Validate required fields
    if (!dto.species || dto.species.trim() === '') {
      throw new BadRequestException('species is required');
    }
    
    if (!dto.age || dto.age.trim() === '') {
      throw new BadRequestException('age is required');
    }
    
    // Convert file to base64 if provided
    let profileImage: string | undefined;
    if (file) {
      profileImage = file.buffer.toString('base64');
    }

    console.log("[createPet] Passed validation, creating pet...");

    // Add data URI prefix to base64 image for proper display
    let profileImageWithPrefix: string | undefined;
    if (profileImage) {
      profileImageWithPrefix = `data:image/jpeg;base64,${profileImage}`;
    }

    return this.petsService.createPet(user.sub, {
      ownerId: user.sub,
      name: dto.name && dto.name.trim() ? dto.name : undefined,
      species: dto.species.trim(),
      breed: dto.breed && dto.breed.trim() ? dto.breed : undefined,
      age: dto.age.trim(),
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weight: dto.weight && dto.weight.trim() ? parseFloat(dto.weight) : undefined,
      microchip: dto.microchip && dto.microchip.trim() ? dto.microchip : undefined,
      vaccinesUpToDate: dto.vaccinesUpToDate ? dto.vaccinesUpToDate === 'true' : undefined,
      bloodType: dto.bloodType && dto.bloodType.trim() ? dto.bloodType : undefined,
      notes: dto.notes && dto.notes.trim() ? dto.notes : undefined,
      profileImage: profileImageWithPrefix,
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
      const base64 = file.buffer.toString('base64');
      profileImage = `data:image/jpeg;base64,${base64}`;
    }

    return this.petsService.updatePet(petId, user.sub, {
      name: dto.name && dto.name.trim() ? dto.name : undefined,
      breed: dto.breed && dto.breed.trim() ? dto.breed : undefined,
      age: dto.age && dto.age.trim() ? dto.age : undefined,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weight: dto.weight && dto.weight.trim() ? parseFloat(dto.weight) : undefined,
      vaccinesUpToDate: dto.vaccinesUpToDate ? dto.vaccinesUpToDate === 'true' : undefined,
      bloodType: dto.bloodType && dto.bloodType.trim() ? dto.bloodType : undefined,
      notes: dto.notes && dto.notes.trim() ? dto.notes : undefined,
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
