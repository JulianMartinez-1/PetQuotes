"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, Circle, InfoWindow } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { X, Phone, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLINIC_CATALOG } from "@/lib/clinic-catalog";

interface ClinicMapProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  selectedCity?: string;
  onClose: () => void;
}

interface Clinic {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  phone: string;
  rating: number;
  image: string;
  distanceKm: number;
  openNow: boolean;
  services?: string[];
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export function ClinicsMap({ userLocation, selectedCity, onClose }: ClinicMapProps) {
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 4.7110,
    lng: -74.0076,
  });
  const [radius, setRadius] = useState(15000); // 15km en metros (aumentado de 5km)
  const mapRef = useRef<GoogleMap | null>(null);

  // Actualizar clínicas filtradas y ubicación del mapa
  useEffect(() => {
    console.log("📍 useEffect de mapa disparado");
    console.log("userLocation:", userLocation);
    console.log("selectedCity:", selectedCity);
    
    if (userLocation?.latitude && userLocation?.longitude) {
      // Si tenemos ubicación del usuario, centrar en él
      setMapCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      
      console.log(`✅ Centrando mapa en: ${userLocation.latitude}, ${userLocation.longitude}`);

      // Filtrar clínicas cercanas a la ubicación del usuario
      const nearby = CLINIC_CATALOG.filter((clinic) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          clinic.latitude,
          clinic.longitude
        );
        return distance <= radius / 1000; // Convertir metros a km
      });
      
      console.log(`📍 Ubicación del usuario: ${userLocation.latitude}, ${userLocation.longitude}`);
      console.log(`📍 Radio de búsqueda: ${(radius / 1000).toFixed(1)} km`);
      console.log(`🏥 Clínicas encontradas: ${nearby.length}`);
      
      setFilteredClinics(nearby.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      }));
    } else if (selectedCity) {
      // Si solo tenemos ciudad, filtrar por ciudad
      const cityClinics = CLINIC_CATALOG.filter((c) => c.city === selectedCity);
      console.log(`🏙️ Ciudad seleccionada: ${selectedCity}`);
      console.log(`🏥 Clínicas en ${selectedCity}: ${cityClinics.length}`);
      setFilteredClinics(cityClinics);

      // Centrar mapa en la ciudad
      if (cityClinics.length > 0) {
        const avgLat =
          cityClinics.reduce((sum, c) => sum + c.latitude, 0) /
          cityClinics.length;
        const avgLng =
          cityClinics.reduce((sum, c) => sum + c.longitude, 0) /
          cityClinics.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    } else {
      // Si no hay ubicación ni ciudad, mostrar todas las clínicas
      console.log(`🏥 Mostrando todas las clínicas: ${CLINIC_CATALOG.length}`);
      setFilteredClinics(CLINIC_CATALOG);
      
      // Centrar en el promedio de todas las clínicas
      if (CLINIC_CATALOG.length > 0) {
        const avgLat = CLINIC_CATALOG.reduce((sum, c) => sum + c.latitude, 0) / CLINIC_CATALOG.length;
        const avgLng = CLINIC_CATALOG.reduce((sum, c) => sum + c.longitude, 0) / CLINIC_CATALOG.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    }
  }, [userLocation, selectedCity, radius]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radio de la tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-dark"
    >
      {/* Header */}
      <div className={cn(
        "relative z-10 bg-surface border-b border-border/30",
        "p-4 flex items-center justify-between"
      )}>
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {selectedCity ? `Clínicas en ${selectedCity}` : "Clínicas Cercanas"}
          </h2>
          <p className="text-sm text-text-secondary">
            {filteredClinics.length} clínicas encontradas
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <X size={24} className="text-text-primary" />
        </button>
      </div>

      {/* Radius Control + Show All Button */}
      <div className={cn(
        "relative z-10 bg-surface/80 backdrop-blur-sm",
        "px-4 py-3 border-b border-border/30",
        "flex items-center gap-3 flex-wrap"
      )}>
        {userLocation && (
          <>
            <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
              Radio:
            </label>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="flex-1 min-w-32 h-2 rounded-lg appearance-none bg-border/30 cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--color-secondary)) 0%, hsl(var(--color-secondary)) ${(radius / 50000) * 100}%, hsl(var(--color-border)/0.3) ${(radius / 50000) * 100}%, hsl(var(--color-border)/0.3) 100%)`,
              }}
            />
            <span className="text-sm font-semibold text-text-primary bg-secondary/20 px-3 py-1 rounded-lg whitespace-nowrap">
              {(radius / 1000).toFixed(1)} km
            </span>
          </>
        )}
        
        <button
          onClick={() => {
            // Resetear a mostrar todas las clínicas
            setRadius(50000);
          }}
          className="ml-auto px-3 py-1 text-sm font-medium bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-lg transition-all text-secondary whitespace-nowrap"
        >
          Ver todas
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <GoogleMap
          ref={mapRef}
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={11}
          options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              fullscreenControl: true,
              styles: [
                {
                  elementType: "geometry",
                  stylers: [{ color: "#141414" }],
                },
                {
                  elementType: "labels.icon",
                  stylers: [{ visibility: "off" }],
                },
                {
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#8a8a8a" }],
                },
                {
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#141414" }, { weight: 5.2 }],
                },
                {
                  featureType: "administrative.country",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#2c2c2c" }, { weight: 0.5 }],
                },
                {
                  featureType: "administrative.land_parcel",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#646464" }],
                },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9a9a9a" }],
                },
                {
                  featureType: "administrative.neighborhood",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#7a7a7a" }],
                },
                {
                  featureType: "administrative.province",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#3a3a3a" }],
                },
                {
                  featureType: "administrative.province",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#8a8a8a" }],
                },
                {
                  featureType: "landscape",
                  elementType: "geometry",
                  stylers: [{ color: "#0a0a0a" }],
                },
                {
                  featureType: "landscape.man_made",
                  elementType: "geometry",
                  stylers: [{ color: "#1a1a1a" }],
                },
                {
                  featureType: "landscape.natural",
                  elementType: "geometry",
                  stylers: [{ color: "#0f0f0f" }],
                },
                {
                  featureType: "poi",
                  elementType: "geometry",
                  stylers: [{ color: "#1a1a1a" }],
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#5a5a5a" }],
                },
                {
                  featureType: "poi.business",
                  elementType: "geometry",
                  stylers: [{ color: "#1a1a1a" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#0a3d1a" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#5a8a5a" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#262626" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#191919" }],
                },
                {
                  featureType: "road",
                  elementType: "labels.icon",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#8c8c8c" }],
                },
                {
                  featureType: "road.arterial",
                  elementType: "geometry",
                  stylers: [{ color: "#2a2a2a" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#3a3a3a" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#1a1a1a" }],
                },
                {
                  featureType: "road.highway.controlled_access",
                  elementType: "geometry",
                  stylers: [{ color: "#4a4a4a" }],
                },
                {
                  featureType: "road.highway.controlled_access",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#2a2a2a" }],
                },
                {
                  featureType: "road.local",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6a6a6a" }],
                },
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [{ color: "#1a1a1a" }],
                },
                {
                  featureType: "transit",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#5a5a5a" }],
                },
                {
                  featureType: "transit.line",
                  elementType: "geometry.fill",
                  stylers: [{ color: "#2a2a2a" }],
                },
                {
                  featureType: "transit.line",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6a6a6a" }],
                },
                {
                  featureType: "transit.station",
                  elementType: "geometry",
                  stylers: [{ color: "#1a1a1a" }],
                },
                {
                  featureType: "transit.station.airport",
                  elementType: "geometry",
                  stylers: [{ color: "#1a1a1a" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#0d1519" }],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#4a6a7a" }],
                },
              ],
              gestureHandling: "greedy",
            }}
          >
            {/* Marcador de ubicación del usuario */}
            {userLocation && (
              <>
                <Marker
                  position={{
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                  }}
                  title="Tu ubicación"
                  icon={{
                    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
                    fillColor: "#10b981",
                    fillOpacity: 1,
                    scale: 2,
                    strokeColor: "white",
                    strokeWeight: 1,
                  } as any}
                />

                {/* Círculo de radio */}
                <Circle
                  center={{
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                  }}
                  radius={radius}
                  options={{
                    fillColor: "#10b981",
                    fillOpacity: 0.1,
                    strokeColor: "#10b981",
                    strokeOpacity: 0.3,
                    strokeWeight: 2,
                  }}
                />
              </>
            )}

            {/* Marcadores de clínicas */}
            {filteredClinics.map((clinic) => (
              <Marker
                key={clinic.id}
                position={{
                  lat: clinic.latitude,
                  lng: clinic.longitude,
                }}
                title={clinic.name}
                onClick={() => setSelectedMarker(clinic.id)}
                icon={{
                  path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
                  fillColor: "#ec4899",
                  fillOpacity: 1,
                  scale: 2,
                  strokeColor: "white",
                  strokeWeight: 1,
                } as any}
              />
            ))}

            {/* Info Window */}
            {selectedMarker && filteredClinics.find(c => c.id === selectedMarker) && (
              <InfoWindow
                position={{
                  lat: filteredClinics.find(c => c.id === selectedMarker)?.latitude || 0,
                  lng: filteredClinics.find(c => c.id === selectedMarker)?.longitude || 0,
                }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="bg-surface rounded-lg p-3 text-sm max-w-xs">
                  {filteredClinics.find(c => c.id === selectedMarker) && (
                    <ClinicInfoCard
                      clinic={filteredClinics.find(c => c.id === selectedMarker)!}
                    />
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
      </div>

      {/* Bottom Sheet - Clinics List */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3 }}
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10",
          "bg-surface border-t border-border/30",
          "rounded-t-3xl p-4 max-h-[40vh] overflow-y-auto"
        )}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-1 bg-border/30 rounded-full" />
        </div>

        <h3 className="font-bold text-text-primary mb-4">
          {filteredClinics.length} {filteredClinics.length === 1 ? "Clínica" : "Clínicas"}
        </h3>

        <div className="space-y-3">
          {filteredClinics.length === 0 ? (
            <div className="text-center py-8">
              <MapPin size={32} className="mx-auto text-text-tertiary mb-3 opacity-50" />
              <p className="text-text-secondary text-sm mb-2">No hay clínicas en esta área</p>
              <p className="text-text-tertiary text-xs">
                {userLocation 
                  ? "Intenta ampliar el radio de búsqueda" 
                  : "Activa tu ubicación para ver clínicas cercanas"}
              </p>
            </div>
          ) : (
            filteredClinics.map((clinic) => (
              <motion.button
                key={clinic.id}
                onClick={() => setSelectedMarker(clinic.id)}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "w-full p-3 rounded-xl border transition-all text-left",
                  selectedMarker === clinic.id
                    ? "bg-secondary/10 border-secondary"
                    : "bg-surface/50 border-border/30 hover:border-secondary/50"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-text-primary">{clinic.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {clinic.neighborhood}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-warning text-warning" />
                    <span className="text-sm font-semibold">{clinic.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <MapPin size={12} />
                  <span>{clinic.distanceKm.toFixed(1)} km</span>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ClinicInfoCard({ clinic }: { clinic: Clinic }) {
  return (
    <div className="space-y-3 w-full">
      <div>
        <h4 className="font-bold text-text-primary text-sm leading-tight mb-1">{clinic.name}</h4>
        <div className="flex items-center gap-1.5 text-xs">
          <Star size={14} className="fill-warning text-warning flex-shrink-0" />
          <span className="font-medium text-text-primary">{clinic.rating}</span>
          <span className="text-text-secondary">•</span>
          <span className="text-text-secondary">{clinic.city}</span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-mint flex-shrink-0" />
          <span>{clinic.neighborhood}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-secondary flex-shrink-0" />
          <span className="truncate">{clinic.phone}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {clinic.services?.slice(0, 2).map((service) => (
          <span
            key={service}
            className="text-xs bg-primary-600/20 text-primary-600 px-2 py-0.5 rounded dark:bg-primary-600/30 dark:text-primary-300"
          >
            {service}
          </span>
        ))}
      </div>

      <Button variant="primary" size="sm" className="w-full mt-2 text-xs">
        Ver Detalles
      </Button>
    </div>
  );
}
