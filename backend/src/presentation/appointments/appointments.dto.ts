import { IsString, IsOptional, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  clinicId: string;

  @IsString()
  petId: string;

  @IsString()
  service: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in format YYYY-MM-DD' })
  date: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'time must be in format HH:mm' })
  time: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AppointmentResponseDto {
  id: string;
  clientId: string;
  petId: string;
  professionalId: string;
  serviceId: string;
  branchId: string;
  clinicId: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
