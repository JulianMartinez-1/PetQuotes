"use client";

import { requestJson, API_BASE_URL } from "@/lib/api-client";

export interface ClinicResponse {
  id: string;
  ownerUserId: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  licenseNumber: string;
  logo?: string;
  rating: number;
  isVerified: boolean;
}

export interface ProfessionalResponse {
  id: string;
  userId: string;
  branchId: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio?: string;
  profileImage?: string;
  isActive: boolean;
}

export interface AvailabilityResponse {
  id: string;
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// Clinics Service
export const clinicsService = {
  // Get all clinics with pagination
  getAll: async (page = 1, limit = 10) => {
    return requestJson<ClinicResponse[]>("/clinics", {
      query: { page: String(page), limit: String(limit) },
    });
  },

  // Get clinic by ID
  getById: async (id: string) => {
    return requestJson<ClinicResponse>(`/clinics/${id}`);
  },

  // Get verified clinics only
  getVerified: async (page = 1, limit = 10) => {
    return requestJson<ClinicResponse[]>("/clinics/verified", {
      query: { page: String(page), limit: String(limit) },
    });
  },

  // Search clinics by name or location
  search: async (query: string, page = 1, limit = 10) => {
    return requestJson<ClinicResponse[]>("/clinics/search", {
      query: { 
        q: query,
        page: String(page), 
        limit: String(limit) 
      },
    });
  },

  // Get top-rated clinics
  getTopRated: async (limit = 6) => {
    return requestJson<ClinicResponse[]>("/clinics/top-rated", {
      query: { limit: String(limit) },
    });
  },
};

// Professionals Service
export const professionalsService = {
  // Get professionals by specialty
  getBySpecialty: async (specialty: string, page = 1, limit = 10) => {
    return requestJson<ProfessionalResponse[]>("/professionals", {
      query: { 
        specialty,
        page: String(page), 
        limit: String(limit) 
      },
    });
  },

  // Get professional by ID
  getById: async (id: string) => {
    return requestJson<ProfessionalResponse>(`/professionals/${id}`);
  },

  // Get professionals by branch
  getByBranch: async (branchId: string) => {
    return requestJson<ProfessionalResponse[]>("/professionals", {
      query: { branchId },
    });
  },

  // Get availability for a professional
  getAvailability: async (professionalId: string) => {
    return requestJson<AvailabilityResponse[]>(
      `/professionals/${professionalId}/availability`
    );
  },
};

// Health Check
export const healthService = {
  check: async () => {
    return fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json())
      .catch(() => ({ status: "unavailable" }));
  },
};

export default {
  clinicsService,
  professionalsService,
  healthService,
};
