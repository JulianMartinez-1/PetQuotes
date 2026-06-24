"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, MapPin, Phone, FileText, Hash, Loader2, AlertCircle } from "lucide-react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { VeterinaryClinicData } from "@/lib/auth-api";

const SERVICE_OPTIONS = [
  { value: "consultation", label: "Consulta general" },
  { value: "vaccination", label: "Vacunación" },
  { value: "surgery", label: "Cirugía" },
  { value: "dental", label: "Odontología" },
  { value: "grooming", label: "Estética / Grooming" },
  { value: "emergency", label: "Urgencias" },
];

const DEFAULT_CENTER = { lat: 4.711, lng: -74.0721 }; // Bogotá

interface VeterinaryClinicFormProps {
  value: Partial<VeterinaryClinicData>;
  onChange: (data: Partial<VeterinaryClinicData>) => void;
}

export function VeterinaryClinicForm({ value, onChange }: VeterinaryClinicFormProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => { valueRef.current = value; onChangeRef.current = onChange; });

  const set = (patch: Partial<VeterinaryClinicData>) =>
    onChange({ ...value, ...patch });

  const toggleService = (svc: string) => {
    const current = value.services ?? [];
    const next = current.includes(svc)
      ? current.filter((s) => s !== svc)
      : [...current, svc];
    set({ services: next });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError(true);
      setMapLoading(false);
      return;
    }

    let isDisposed = false;

    const initMap = async () => {
      try {
        setOptions({ key: apiKey });
        await importLibrary("maps");

        if (isDisposed || !mapContainerRef.current) return;

        const center =
          valueRef.current.latitude && valueRef.current.longitude
            ? { lat: valueRef.current.latitude, lng: valueRef.current.longitude }
            : DEFAULT_CENTER;

        const map = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
          zoomControl: true,
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          ],
        });

        setMapLoading(false);

        let marker: google.maps.Marker | null = null;

        const setCoords = (lat: number, lng: number) => {
          onChangeRef.current({
            ...valueRef.current,
            latitude: Math.round(lat * 1e6) / 1e6,
            longitude: Math.round(lng * 1e6) / 1e6,
          });
        };

        const placeMarker = (latLng: google.maps.LatLng) => {
          const lat = latLng.lat();
          const lng = latLng.lng();
          setCoords(lat, lng);

          if (marker) {
            marker.setPosition(latLng);
          } else {
            marker = new google.maps.Marker({
              map,
              position: latLng,
              draggable: true,
              animation: google.maps.Animation.DROP,
              title: "Ubicación de la veterinaria",
            });

            marker.addListener("dragend", () => {
              const pos = marker!.getPosition();
              if (pos) setCoords(pos.lat(), pos.lng());
            });
          }
        };

        // Place marker if we already have coordinates
        if (valueRef.current.latitude && valueRef.current.longitude) {
          placeMarker(
            new google.maps.LatLng(
              valueRef.current.latitude,
              valueRef.current.longitude,
            ),
          );
        }

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) placeMarker(e.latLng);
        });
      } catch {
        if (!isDisposed) {
          setMapError(true);
          setMapLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isDisposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Clinic name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Nombre de la veterinaria <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
          <Input
            type="text"
            placeholder="Clínica Veterinaria San Roque"
            value={value.clinicName ?? ""}
            onChange={(e) => set({ clinicName: e.target.value })}
            className="pl-10"
            variant="default"
            required
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Ciudad <span className="text-danger">*</span>
        </label>
        <Input
          type="text"
          placeholder="Bogotá"
          value={value.city ?? ""}
          onChange={(e) => set({ city: e.target.value })}
          variant="default"
          required
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Dirección <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
          <Input
            type="text"
            placeholder="Calle 45 # 12-34"
            value={value.address ?? ""}
            onChange={(e) => set({ address: e.target.value })}
            className="pl-10"
            variant="default"
            required
          />
        </div>
      </div>

      {/* Map picker */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Ubicación en mapa{" "}
          <span className="text-xs text-text-muted font-normal">(haz clic para marcar)</span>
        </label>
        <div
          className="relative rounded-xl overflow-hidden border border-border"
          style={{ height: 220 }}
        >
          {mapLoading && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-light z-10">
              <Loader2 size={20} className="animate-spin text-text-muted" />
            </div>
          )}
          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-light gap-2 z-10">
              <AlertCircle size={20} className="text-warning" />
              <p className="text-xs text-text-muted">No se pudo cargar el mapa</p>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
        {value.latitude && value.longitude && (
          <p className="mt-1 text-xs text-text-muted">
            {value.latitude}, {value.longitude}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Teléfono</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
          <Input
            type="tel"
            placeholder="+57 301 234 5678"
            value={value.phone ?? ""}
            onChange={(e) => set({ phone: e.target.value })}
            className="pl-10"
            variant="default"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Descripción</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-text-muted size-4" />
          <textarea
            placeholder="Descripción de la veterinaria, especialidades, años de experiencia..."
            value={value.description ?? ""}
            onChange={(e) => set({ description: e.target.value })}
            rows={2}
            className={cn(
              "w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary",
              "placeholder:text-text-muted resize-none",
              "focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600",
            )}
          />
        </div>
      </div>

      {/* License number */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Número de licencia / registro
        </label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
          <Input
            type="text"
            placeholder="VET-2024-00123"
            value={value.licenseNumber ?? ""}
            onChange={(e) => set({ licenseNumber: e.target.value })}
            className="pl-10"
            variant="default"
          />
        </div>
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Servicios que ofrece
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_OPTIONS.map((svc) => {
            const checked = (value.services ?? []).includes(svc.value);
            return (
              <button
                key={svc.value}
                type="button"
                onClick={() => toggleService(svc.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left",
                  checked
                    ? "border-primary-600 bg-primary-600/8 text-primary-600"
                    : "border-border bg-surface text-text-secondary hover:border-primary-600/50",
                )}
              >
                <span
                  className={cn(
                    "size-3.5 rounded border shrink-0 flex items-center justify-center",
                    checked ? "bg-primary-600 border-primary-600" : "border-border",
                  )}
                >
                  {checked && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-white">
                      <path d="M1 4l2.5 2.5L9 1" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                {svc.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
