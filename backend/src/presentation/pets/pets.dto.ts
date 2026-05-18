import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreatePetDto {
  @IsString()
  name: string;

  @IsString()
  species: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  microchip?: string;

  @IsOptional()
  @IsBoolean()
  vaccinesUpToDate?: boolean;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  vaccinesUpToDate?: boolean;

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
  name: string;
  species: string;
  breed: string | null;
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
