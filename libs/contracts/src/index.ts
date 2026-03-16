export type UserRole = "CLIENT" | "VETERINARY" | "ADMIN";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "RESCHEDULED";

export interface AppointmentDto {
  id: string;
  clientId: string;
  petId: string;
  veterinarianId: string;
  serviceId: string;
  branchId: string;
  status: AppointmentStatus;
  startsAt: string;
  notes?: string;
}