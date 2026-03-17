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

export async function createAppointment(payload: CreateAppointmentPayload) {
  return requestJson("/api/appointments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
