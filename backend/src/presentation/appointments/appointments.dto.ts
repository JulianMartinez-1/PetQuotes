import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  clinicId: string;

  @IsString()
  petId: string;

  @IsString()
  service: string;

  @IsDateString()
  date: string;

  @IsString()
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
