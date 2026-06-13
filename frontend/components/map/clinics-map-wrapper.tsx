"use client";

import { ClinicsMap } from "./clinics-map";
import { useEffect, useState } from "react";

interface ClinicMapProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  selectedCity?: string;
  onClose: () => void;
}

export function ClinicsMapWrapper({ userLocation, selectedCity, onClose }: ClinicMapProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.google) {
      setError("Google Maps no está disponible. Recarga la página.");
      console.error("❌ window.google no está disponible");
      return;
    }
    console.log("✅ Google Maps está disponible");
  }, []);

  return (
    <>
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 backdrop-blur-sm">
          <div className="bg-surface border border-border/30 rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-text-primary mb-2">⚠️ Error de Configuración</h3>
            <p className="text-text-secondary text-sm">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 w-full px-4 py-2 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-lg text-secondary font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {!error && (
        <ClinicsMap 
          userLocation={userLocation}
          selectedCity={selectedCity}
          onClose={onClose}
        />
      )}
    </>
  );
}
