export type ClinicCatalogItem = {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  distanceKm: number;
  openNow: boolean;
  image: string;
  description: string;
  phone: string;
};

export interface SearchClinicsResponse {
  city: string;
  clinics: ClinicCatalogItem[];
  timestamp: string;
  source: 'google_places' | 'local_storage';
}
