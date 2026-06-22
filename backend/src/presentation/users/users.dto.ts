import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsIn(['EMAIL', 'WHATSAPP'])
  notificationChannel?: 'EMAIL' | 'WHATSAPP';
}

export class UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  profileImage: string | null;
  notificationChannel: string | null;
  createdAt: Date;
  updatedAt: Date;
}
