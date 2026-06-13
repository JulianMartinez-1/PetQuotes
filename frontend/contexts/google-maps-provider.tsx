"use client";

import { LoadScript } from "@react-google-maps/api";
import { ReactNode } from "react";

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    console.error("❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está configurada");
    return <>{children}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={["places"]}
      onLoad={() => {
        console.log("✅ Google Maps API cargada globalmente");
      }}
      onError={(error) => {
        console.error("❌ Error al cargar Google Maps:", error);
      }}
    >
      {children}
    </LoadScript>
  );
}
