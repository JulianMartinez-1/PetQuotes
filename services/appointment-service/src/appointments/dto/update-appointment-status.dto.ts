import { IsIn } from "class-validator";

export class UpdateAppointmentStatusDto {
  @IsIn(["CONFIRMED", "CANCELLED", "RESCHEDULED"])
  status!: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
}
