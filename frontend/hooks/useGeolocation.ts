"use client";

import { useState, useCallback, useEffect } from "react";

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => void;
  hasPermission: boolean | null;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Verificar permiso al montar
  useEffect(() => {
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" } as any)
        .then((result) => {
          setHasPermission(result.state === "granted");
          if (result.state === "granted") {
            getCurrentPosition();
          }
        })
        .catch(() => {
          // Si no se puede verificar el permiso, asumir que no está concedido
          setHasPermission(false);
        });
    }
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation no está soportada en tu navegador");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoordinates({ latitude, longitude, accuracy });
        setHasPermission(true);
        setLoading(false);
      },
      (err) => {
        let errorMsg = "Error al obtener ubicación";

        if (err.code === 1) {
          errorMsg = "Permiso de ubicación denegado";
          setHasPermission(false);
        } else if (err.code === 2) {
          errorMsg = "Ubicación no disponible";
        } else if (err.code === 3) {
          errorMsg = "Tiempo de espera agotado";
        }

        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const requestPermission = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    coordinates,
    loading,
    error,
    requestPermission,
    hasPermission,
  };
}
