export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

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
  const response = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "No se pudo crear la cita");
  }

  return response.json();
}
