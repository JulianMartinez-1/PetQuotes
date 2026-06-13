"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface GeolocationContextType {
  coordinates: { latitude: number; longitude: number } | null;
  hasPermission: boolean | null;
  isPermissionShown: boolean;
  requestLocationPermission: () => void;
  dismissLocationPermission: () => void;
  loading: boolean;
  error: string | null;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isPermissionShown, setIsPermissionShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar si ya se mostró el permiso al usuario
  useEffect(() => {
    const alreadyShown = localStorage.getItem("geolocationPermissionShown");
    const savedCoordinates = localStorage.getItem("userCoordinates");

    if (alreadyShown === "true") {
      setIsPermissionShown(true);
      if (savedCoordinates) {
        try {
          setCoordinates(JSON.parse(savedCoordinates));
        } catch (e) {
          console.error("Error parsing saved coordinates:", e);
        }
      }
    } else {
      // Primera vez, mostrar el permission
      setIsPermissionShown(false);
    }

    setIsInitialized(true);
  }, []);

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está soportada en tu navegador");
      console.error("❌ navigator.geolocation no disponible");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("⏳ Obteniendo ubicación del dispositivo...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { latitude, longitude };
        
        console.log(`✅ Ubicación obtenida: ${latitude}, ${longitude}`);
        
        setCoordinates(coords);
        setHasPermission(true);
        setIsPermissionShown(true);
        
        // Guardar en localStorage
        localStorage.setItem("geolocationPermissionShown", "true");
        localStorage.setItem("userCoordinates", JSON.stringify(coords));
        
        setLoading(false);
      },
      (err) => {
        let errorMsg = "Error al obtener ubicación";

        if (err.code === 1) {
          errorMsg = "Permiso de ubicación denegado";
          console.error("❌", errorMsg);
          setHasPermission(false);
        } else if (err.code === 2) {
          errorMsg = "Ubicación no disponible";
          console.error("❌", errorMsg);
        } else if (err.code === 3) {
          errorMsg = "Tiempo de espera agotado";
          console.error("❌", errorMsg);
        }

        setError(errorMsg);
        setIsPermissionShown(true);
        
        // Guardar que el usuario rechazó
        localStorage.setItem("geolocationPermissionShown", "true");
        
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const dismissLocationPermission = () => {
    setIsPermissionShown(true);
    localStorage.setItem("geolocationPermissionShown", "true");
  };

  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <GeolocationContext.Provider
      value={{
        coordinates,
        hasPermission,
        isPermissionShown,
        requestLocationPermission,
        dismissLocationPermission,
        loading,
        error,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocationContext() {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error("useGeolocationContext must be used within GeolocationProvider");
  }
  return context;
}
