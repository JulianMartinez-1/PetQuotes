"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuthState } from "./auth-state";

interface Pet {
  id: string;
  name?: string;
  species: string;
  breed?: string;
  age?: string;
  weight?: string;
  profileImage?: string;
  notes?: string;
  createdAt?: string;
}

type PetsStateContextValue = {
  pets: Pet[];
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  addPet: (pet: Pet) => void;
  removePet: (petId: string) => void;
  refreshPets: () => Promise<void>;
};

const PetsStateContext = createContext<PetsStateContextValue | null>(null);

const PETS_STORAGE_KEY = "pets_cache";

export function PetsStateProvider({ children }: PropsWithChildren) {
  const { user, isAuthenticated } = useAuthState();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar mascotas desde la API
  const fetchPets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar si hay caché válido
      const cachedPets = localStorage.getItem(PETS_STORAGE_KEY);
      if (cachedPets) {
        try {
          const parsed = JSON.parse(cachedPets) as Pet[];
          console.log("[Pets] Mascotas cargadas desde caché:", parsed.length);
          setPets(parsed);
        } catch (err) {
          console.warn("[Pets] Error parseando caché:", err);
          localStorage.removeItem(PETS_STORAGE_KEY);
        }
      }

      // Llamar a la API para obtener datos frescos
      const response = await fetch("/api/session/pets");
      
      if (!response.ok) {
        if (response.status === 401) {
          // Sesión expirada o no autenticado
          console.log("[Pets] No autenticado (401)");
          setPets([]);
          return;
        }
        throw new Error(`Failed to fetch pets: ${response.statusText}`);
      }

      const data = await response.json();
      const freshPets = data.items || [];
      
      console.log("[Pets] Mascotas obtenidas de API:", freshPets.length);
      setPets(freshPets);
      
      // Guardar en caché
      try {
        localStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(freshPets));
      } catch (err) {
        console.warn("[Pets] Error guardando caché:", err);
      }

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error("[Pets] Error fetching pets:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Marcar hidratación solo al montar, una vez
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Reaccionar a cambios de autenticación para cargar o limpiar mascotas
  useEffect(() => {
    if (isAuthenticated) {
      void fetchPets();
    } else {
      setPets([]);
      localStorage.removeItem(PETS_STORAGE_KEY);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchPets]);

  const addPet = useCallback((pet: Pet) => {
    setPets((prev) => {
      const updated = [pet, ...prev];
      try {
        localStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("[Pets] Error guardando mascota:", err);
      }
      return updated;
    });
  }, []);

  const removePet = useCallback((petId: string) => {
    setPets((prev) => {
      const updated = prev.filter((p) => p.id !== petId);
      try {
        localStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("[Pets] Error removiendo mascota:", err);
      }
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ pets, isLoading, isHydrated, error, addPet, removePet, refreshPets: fetchPets }),
    [pets, isLoading, isHydrated, error, addPet, removePet, fetchPets]
  );

  return <PetsStateContext.Provider value={value}>{children}</PetsStateContext.Provider>;
}

export function usePetsState() {
  const context = useContext(PetsStateContext);
  if (!context) {
    throw new Error("usePetsState must be used within PetsStateProvider");
  }
  return context;
}
