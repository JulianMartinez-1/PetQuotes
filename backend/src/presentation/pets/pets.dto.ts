import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  species?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  microchip?: string;

  @IsOptional()
  @IsString()
  vaccinesUpToDate?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // This will be handled by the controller via @UseInterceptors(FileInterceptor('profileImage'))
  // File type is handled in the controller, not in the DTO
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  vaccinesUpToDate?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PetResponseDto {
  id: string;
  ownerId: string;
  name: string | null;
  species: string;
  breed: string | null;
  age: string | null;
  birthDate: Date | null;
  weight: number | null;
  microchip: string | null;
  vaccinesUpToDate: boolean;
  bloodType: string | null;
  notes: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
