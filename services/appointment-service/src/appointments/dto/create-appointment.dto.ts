import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  @MinLength(3)
  clientId!: string;

  @IsString()
  petId!: string;

  @IsString()
  veterinarianId!: string;

  @IsString()
  serviceId!: string;

  @IsString()
  branchId!: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
