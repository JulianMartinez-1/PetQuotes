"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { X, Phone, MapPin, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export function ClinicDetailModal({ clinic, onClose }: ClinicDetailModalProps) {
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);

  useEffect(() => {
    if (!window.google) {
      setError("Google Maps no está disponible. Recarga la página.");
      console.error("❌ window.google no está disponible");
      return;
    }
    console.log("✅ Google Maps está disponible");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-4xl h-[90vh] rounded-2xl border border-border/30",
          "bg-surface overflow-hidden flex flex-col"
        )}
      >
        {/* Header */}
        <div className={cn(
          "relative z-10 bg-gradient-to-r from-surface via-surface to-surface/80",
          "p-6 flex items-center justify-between border-b border-border/30"
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
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors flex-shrink-0"
          >
            <X size={24} className="text-text-primary" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Left Side - Info */}
          <div className="w-80 overflow-y-auto flex flex-col gap-6">
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden h-48 flex-shrink-0">
              <Image
                src={clinic.image}
                alt={clinic.name}
                fill
                className="object-cover"
              />
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
              <Button variant="primary" className="w-full">
                Reservar Cita
              </Button>
              <Button variant="secondary" className="w-full" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="flex-1 rounded-xl overflow-hidden border border-border/30">
            {error ? (
              <div className="w-full h-full flex items-center justify-center bg-surface">
                <div className="text-center">
                  <p className="text-text-secondary">{error}</p>
                </div>
              </div>
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
      </motion.div>
    </motion.div>
  );
}
