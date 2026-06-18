import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Pagination DTO
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Search DTO
export class SearchDto {
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Response DTOs
export class MessageDto {
  message: string;
}

export class IdDto {
  id: string;
}

// Auth DTOs
export class LoginCredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto extends LoginCredentialsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
