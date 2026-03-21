export type UserRole = "CLIENT" | "VETERINARY" | "ADMIN";

export const APPOINTMENT_ROUTE_ROLE_POLICY = {
  createAppointment: ["CLIENT", "ADMIN"],
  listAppointmentsByPet: ["CLIENT", "ADMIN"],
  updateAppointmentStatus: ["VETERINARY", "ADMIN"],
  rescheduleAppointment: ["VETERINARY", "ADMIN"]
} as const satisfies Record<string, readonly UserRole[]>;

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