"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Phone, MapPin, Star, Clock, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ClinicDetailModalProps {
  clinic: {
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
    description?: string;
  };
  onClose: () => void;
  onReservar?: () => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function getStaticMapUrl(lat: number, lng: number): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "15",
    size: "800x500",
    maptype: "roadmap",
    markers: `color:0x1D4ED8|${lat},${lng}`,
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export function ClinicDetailModal({ clinic, onClose, onReservar }: ClinicDetailModalProps) {
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const mapRef = useRef<GoogleMap | null>(null);
  const staticMapUrl = getStaticMapUrl(clinic.latitude, clinic.longitude);

  useEffect(() => {
    // If the Maps JS SDK hasn't loaded after 3s, fall back to static map
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      if (!(window as any).google?.maps) setUseStaticFallback(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Modal
      open={true}
      title={clinic.name}
      onClose={onClose}
      showHeader={false}
      maxWidth="max-w-4xl"
      className="h-[90vh] overflow-hidden flex flex-col p-0"
    >
        {/* Header */}
        <div className={cn(
          "relative z-10 bg-gradient-to-r from-surface via-surface to-surface/80",
          "p-6 flex items-center justify-between border-b border-border/30 shrink-0"
        )}>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              {clinic.name}
            </h2>
            <p className="text-sm text-text-secondary">
              {clinic.city} • {clinic.neighborhood}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors flex-shrink-0"
          >
            <X size={24} className="text-text-primary" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 p-4 sm:p-6">
          {/* Left Side - Info */}
          <div className="md:w-72 lg:w-80 overflow-y-auto flex flex-col gap-4 shrink-0">
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden h-48 flex-shrink-0 bg-gradient-to-br from-secondary/20 to-accent/20">
              {clinic.image ? (
                <Image
                  src={clinic.image}
                  alt={clinic.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <Building2 size={40} className="text-text-tertiary/40" />
                  <p className="text-xs text-text-tertiary">{clinic.city}</p>
                </div>
              )}
            </div>

            {/* Status & Rating */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "px-3 py-1",
                    clinic.openNow
                      ? "bg-success/20 border-success/50 text-success"
                      : "bg-warning/20 border-warning/50 text-warning"
                  )}
                >
                  <Clock size={12} className="inline mr-1" />
                  {clinic.openNow ? "Abierta" : "Cerrada"}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star size={18} className="text-warning fill-warning" />
                  <span className="font-bold text-text-primary">
                    {clinic.rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-text-secondary">
                  <MapPin size={18} className="text-secondary" />
                  <span className="text-sm">{clinic.distanceKm.toFixed(1)} km</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {clinic.description && (
              <div>
                <p className="text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wide">
                  Acerca de
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {clinic.description}
                </p>
              </div>
            )}

            {/* Services */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary mb-3 uppercase tracking-wide">
                Servicios
              </p>
              <div className="flex flex-wrap gap-2">
                {clinic.services?.map((service) => (
                  <Badge
                    key={service}
                    className="bg-secondary/10 border-secondary/30 text-secondary text-xs"
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary mb-3 uppercase tracking-wide">
                Contacto
              </p>
              <a
                href={`tel:${clinic.phone}`}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  "bg-secondary/10 border border-secondary/30 hover:bg-secondary/20",
                  "transition-all text-secondary font-medium"
                )}
              >
                <Phone size={18} />
                {clinic.phone}
              </a>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={onReservar || onClose}
              >
                Reservar Cita
              </Button>
              <Button variant="secondary" className="w-full" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="flex-1 min-h-[200px] md:min-h-0 rounded-xl overflow-hidden border border-border/30">
            {useStaticFallback ? (
              staticMapUrl ? (
                /* Static map fallback when JS SDK fails */
                <div className="relative w-full h-full min-h-[200px]">
                  <Image
                    src={staticMapUrl}
                    alt={`Mapa de ${clinic.name}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-2 right-2 bg-surface/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-text-secondary">
                    📍 {clinic.neighborhood}, {clinic.city}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface">
                  <div className="text-center px-4">
                    <MapPin size={32} className="mx-auto mb-2 text-text-muted opacity-40" />
                    <p className="text-sm text-text-secondary">{clinic.neighborhood}, {clinic.city}</p>
                  </div>
                </div>
              )
            ) : (
              <GoogleMap
                ref={mapRef}
                mapContainerStyle={mapContainerStyle}
                center={{
                  lat: clinic.latitude,
                  lng: clinic.longitude,
                }}
                zoom={15}
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
                      featureType: "landscape",
                      elementType: "geometry",
                      stylers: [{ color: "#0a0a0a" }],
                    },
                    {
                      featureType: "poi",
                      elementType: "geometry",
                      stylers: [{ color: "#1a1a1a" }],
                    },
                    {
                      featureType: "road",
                      elementType: "geometry.fill",
                      stylers: [{ color: "#2a2a2a" }],
                    },
                    {
                      featureType: "road",
                      elementType: "geometry.stroke",
                      stylers: [{ color: "#1a1a1a" }],
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#0f1419" }],
                    },
                  ],
                }}
              >
                <Marker
                  position={{
                    lat: clinic.latitude,
                    lng: clinic.longitude,
                  }}
                  title={clinic.name}
                />
              </GoogleMap>
            )}
          </div>
        </div>
    </Modal>
  );
}
