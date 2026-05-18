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
  const idempotencyKey = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return requestJson("/api/proxy/appointments", {
    method: "POST",
    headers: {
      "x-idempotency-key": idempotencyKey
    },
    body: JSON.stringify(payload)
  });
}

export async function listAppointmentsByPet(petId: string) {
  return requestJson<AppointmentHistoryItem[]>(`/api/proxy/appointments/pet/${petId}`, {
    method: "GET"
  });
}
