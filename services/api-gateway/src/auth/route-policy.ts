export type AuthRole = "CLIENT" | "VETERINARY" | "ADMIN";

export const API_ROUTE_ROLE_POLICY = {
  createAppointment: ["CLIENT", "VETERINARY", "ADMIN"] as AuthRole[],
  listAppointmentsByPet: ["CLIENT", "VETERINARY", "ADMIN"] as AuthRole[],
  updateAppointmentStatus: ["VETERINARY", "ADMIN"] as AuthRole[],
  rescheduleAppointment: ["CLIENT", "VETERINARY", "ADMIN"] as AuthRole[]
};
