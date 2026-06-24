/**
 * API Client for Clinics
 * 
 * This module handles communication with the backend API for clinic data.
 * Supports both local mock data and real API endpoints.
 */

import { ClinicCatalogItem } from "./clinic-catalog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface FetchClinicsOptions {
  city?: string;
  neighborhood?: string;
  service?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

/**
 * Fetch clinics from the backend API
 * @param options - Filter and pagination options
 * @returns Array of clinics
 */
export async function fetchClinicsFromAPI(
  options: FetchClinicsOptions = {}
): Promise<ClinicCatalogItem[]> {
  try {
    const params = new URLSearchParams();

    if (options.city) params.append("city", options.city);
    if (options.neighborhood) params.append("neighborhood", options.neighborhood);
    if (options.service) params.append("service", options.service);
    if (options.latitude) params.append("latitude", options.latitude.toString());
    if (options.longitude) params.append("longitude", options.longitude.toString());
    if (options.radiusKm) params.append("radiusKm", options.radiusKm.toString());
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());

    const url = `${API_BASE_URL}/api/clinics?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching clinics:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.clinics || data || [];
  } catch (error) {
    console.error("Error fetching clinics from API:", error);
    return [];
  }
}

/**
 * Search clinics by query string
 * Searches in clinic names, neighborhoods, services, and descriptions
 * @param query - Search query
 * @returns Array of matching clinics
 */
export async function searchClinics(query: string): Promise<ClinicCatalogItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/clinics/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Error searching clinics:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.clinics || data || [];
  } catch (error) {
    console.error("Error searching clinics:", error);
    return [];
  }
}

/**
 * Get clinic details by ID
 * @param clinicId - The clinic ID
 * @returns Clinic details or null
 */
export async function getClinicDetails(
  clinicId: string
): Promise<ClinicCatalogItem | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/clinics/${clinicId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Error fetching clinic details:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.clinic || data || null;
  } catch (error) {
    console.error("Error fetching clinic details:", error);
    return null;
  }
}

/**
 * Get nearby clinics by user location
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radiusKm - Search radius in kilometers (default: 5)
 * @returns Array of nearby clinics sorted by distance
 */
export async function getNearByClinics(
  latitude: number,
  longitude: number,
  radiusKm: number = 5
): Promise<ClinicCatalogItem[]> {
  return fetchClinicsFromAPI({
    latitude,
    longitude,
    radiusKm,
  });
}

/**
 * Get available cities from clinics database
 * @returns Array of city names
 */
export async function getAvailableCities(): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/clinics/cities`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Error fetching cities:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.cities || data || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

/**
 * Get available services from clinics
 * @returns Array of service names
 */
export async function getAvailableServices(): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/clinics/services`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Error fetching services:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.services || data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

/**
 * Search clinics in a specific city using Google Places API
 * @param city - City name (Bogota, Medellin, Cali)
 * @returns Array of clinics from Google Places
 */
export async function searchClinicsByCity(city: string): Promise<ClinicCatalogItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/clinics/search?city=${encodeURIComponent(city)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`Error searching clinics in ${city}:`, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.clinics || [];
  } catch (error) {
    console.error(`Error fetching clinics from ${city}:`, error);
    return [];
  }
}

/**
 * Search clinics in all major cities
 * @returns Array of clinics from all cities
 */
export async function searchAllCities(): Promise<ClinicCatalogItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/clinics/search-all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Error searching all cities:", response.statusText);
      return [];
    }

    const data = await response.json();
    const results = data.results || [];
    return results.flatMap((r: any) => r.clinics) || [];
  } catch (error) {
    console.error("Error fetching clinics from all cities:", error);
    return [];
  }
}

export interface PlatformClinicsResponse {
  clinics: ClinicCatalogItem[];
  independents: {
    id: string;
    ownerName: string;
    serviceArea: string;
    homeVisits: boolean;
    coverageRadius?: number;
  }[];
}

export async function fetchPlatformClinics(): Promise<PlatformClinicsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/clinics/platform-registered`, {
      cache: "no-store",
    });
    if (!response.ok) return { clinics: [], independents: [] };
    return response.json();
  } catch {
    return { clinics: [], independents: [] };
  }
}

/**
 * Search nearby clinics using user's GPS coordinates
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radiusKm - Search radius in kilometers (default: 5)
 * @returns Array of nearby clinics
 */
export async function searchNearByClinics(
  latitude: number,
  longitude: number,
  radiusKm: number = 5
): Promise<ClinicCatalogItem[]> {
  try {
    const url = `${API_BASE_URL}/api/clinics/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error searching nearby clinics:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.clinics || [];
  } catch (error) {
    console.error("Error searching nearby clinics:", error);
    return [];
  }
}
