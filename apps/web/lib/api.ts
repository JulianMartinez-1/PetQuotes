import { requestJson } from "@/lib/api-client";

export type CreateAppointmentPayload = {
  clientId: string;
  petId: string;
  veterinarianId: string;
  serviceId: string;
  branchId: string;
  startsAt: string;
  notes?: string;
};

export type AppointmentHistoryItem = {
  id: string;
  startsAt: string;
  status?: string;
  serviceId?: string;
  veterinarianId?: string;
  branchId?: string;
};

export async function createAppointment(payload: CreateAppointmentPayload) {
  return requestJson("/api/proxy/appointments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function listAppointmentsByPet(petId: string) {
  return requestJson<AppointmentHistoryItem[]>(`/api/proxy/appointments/pet/${petId}`, {
    method: "GET"
  });
}
