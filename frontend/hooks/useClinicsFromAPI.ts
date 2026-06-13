"use client";

import { useEffect, useState } from 'react';
import { ClinicCatalogItem } from '@/lib/clinic-catalog';
import { searchClinicsByCity, searchAllCities } from '@/lib/clinics-api';
import { getClinicsFromStorage } from '@/lib/clinic-storage';

export interface UseClinicDataOptions {
  city?: string;
  useLocalFallback?: boolean;
}

export function useClinicsFromAPI(options: UseClinicDataOptions = {}) {
  const [clinics, setClinics] = useState<ClinicCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: ClinicCatalogItem[];

        if (options.city) {
          // Buscar en una ciudad específica
          data = await searchClinicsByCity(options.city);
        } else {
          // Buscar en todas las ciudades
          data = await searchAllCities();
        }

        // Si no hay resultados y hay fallback local, usar datos locales
        if (data.length === 0 && options.useLocalFallback !== false) {
          const localClinics = getClinicsFromStorage();
          data = localClinics;
        }

        setClinics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback a datos locales en caso de error
        if (options.useLocalFallback !== false) {
          const localClinics = getClinicsFromStorage();
          setClinics(localClinics);
        }
      } finally {
        setLoading(false);
      }
    };

    loadClinics();
  }, [options.city, options.useLocalFallback]);

  return { clinics, loading, error };
}
