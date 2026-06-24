import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VeterinaryClinicDataDto {
  @IsString()
  @MinLength(2)
  clinicName: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(5)
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];
}

export class VeterinaryIndependentDataDto {
  @IsString()
  @MinLength(2)
  serviceArea: string;

  @IsBoolean()
  homeVisits: boolean;

  @IsOptional()
  @IsNumber()
  coverageRadius?: number;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsIn(['CLIENT', 'VETERINARY'])
  role?: 'CLIENT' | 'VETERINARY';

  @IsOptional()
  @IsIn(['CLINIC', 'INDEPENDENT'])
  veterinaryType?: 'CLINIC' | 'INDEPENDENT';

  @IsOptional()
  @ValidateIf((o) => o.veterinaryType === 'CLINIC')
  @ValidateNested()
  @Type(() => VeterinaryClinicDataDto)
  clinicData?: VeterinaryClinicDataDto;

  @IsOptional()
  @ValidateIf((o) => o.veterinaryType === 'INDEPENDENT')
  @ValidateNested()
  @Type(() => VeterinaryIndependentDataDto)
  independentData?: VeterinaryIndependentDataDto;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
