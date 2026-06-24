import { requestJson } from "@/lib/api-client";

export interface VetRequest {
  id: string;
  veterinaryType: "CLINIC" | "INDEPENDENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
  clinic: {
    id: string;
    name: string;
    description: string | null;
    phone: string | null;
    licenseNumber: string | null;
    branches: {
      city: string;
      address: string;
      latitude: number;
      longitude: number;
      phone: string | null;
    }[];
    services: { name: string; category: string }[];
  } | null;
  serviceArea: string | null;
  homeVisits: boolean;
  coverageRadius: number | null;
}

export async function getVetRequests(
  status: "PENDING" | "APPROVED" | "REJECTED" = "PENDING",
): Promise<VetRequest[]> {
  return requestJson<VetRequest[]>("/api/proxy/admin/veterinary-requests", {
    query: { status },
  });
}

export async function approveVetRequest(id: string): Promise<{ success: boolean }> {
  return requestJson<{ success: boolean }>(
    `/api/proxy/admin/veterinary-requests/${id}/approve`,
    { method: "PATCH" },
  );
}

export async function rejectVetRequest(id: string, reason: string): Promise<{ success: boolean }> {
  return requestJson<{ success: boolean }>(
    `/api/proxy/admin/veterinary-requests/${id}/reject`,
    { method: "PATCH", body: JSON.stringify({ reason }) },
  );
}
