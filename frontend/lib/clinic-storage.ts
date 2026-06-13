// Cliente-side storage para veterinarias
import { ClinicCatalogItem, CLINIC_CATALOG } from "./clinic-catalog";

const STORAGE_KEY = "pet_quotes_clinics";

export function getClinicsFromStorage(): ClinicCatalogItem[] {
  if (typeof window === "undefined") return CLINIC_CATALOG;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading clinics from storage:", error);
  }
  
  return CLINIC_CATALOG;
}

export function saveClinicsToStorage(clinics: ClinicCatalogItem[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics));
  } catch (error) {
    console.error("Error saving clinics to storage:", error);
  }
}

export function addClinic(clinic: ClinicCatalogItem): void {
  const clinics = getClinicsFromStorage();
  const exists = clinics.some((c) => c.id === clinic.id);
  
  if (!exists) {
    clinics.push(clinic);
    saveClinicsToStorage(clinics);
  }
}

export function updateClinic(clinic: ClinicCatalogItem): void {
  const clinics = getClinicsFromStorage();
  const index = clinics.findIndex((c) => c.id === clinic.id);
  
  if (index !== -1) {
    clinics[index] = clinic;
    saveClinicsToStorage(clinics);
  }
}

export function deleteClinic(id: string): void {
  const clinics = getClinicsFromStorage();
  const filtered = clinics.filter((c) => c.id !== id);
  saveClinicsToStorage(filtered);
}

export function generateClinicId(): string {
  return `clinic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
