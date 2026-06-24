"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "@/store/auth-state";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  SlidersHorizontal,
  Search,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClinicBookingModal } from "@/components/clinics/clinic-booking-modal";
import { ClinicDetailModal } from "@/components/map/clinic-detail-modal";
import { getClinicsFromStorage } from "@/lib/clinic-storage";
import { searchNearByClinics, fetchPlatformClinics } from "@/lib/clinics-api";
import { CLINIC_CATALOG } from "@/lib/clinic-catalog";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

const CATALOG_PAGE_SIZE = 4;
const CLINICS_CACHE_KEY = "clinics_nearby_cache";
const CLINICS_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

function getStaticMapUrl(lat: number, lng: number): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "15",
    size: "600x300",
    maptype: "roadmap",
    markers: `color:0x1D4ED8|${lat},${lng}`,
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

type SortMode = "rating" | "distance";

interface ClinicsCache {
  data: typeof CLINIC_CATALOG;
  timestamp: number;
  latitude: number;
  longitude: number;
}

// Funciones de utilidad para cacheo
function getCachedClinics(latitude: number, longitude: number): typeof CLINIC_CATALOG | null {
  try {
    if (typeof window === "undefined") return null;
    
    const cached = localStorage.getItem(CLINICS_CACHE_KEY);
    if (!cached) return null;

    const parsed: ClinicsCache = JSON.parse(cached);
    const now = Date.now();
    const isExpired = now - parsed.timestamp > CLINICS_CACHE_TTL;
    
    // Verificar si el caché es para la misma ubicación (tolerancia de 0.1 grados)
    const isSameLocation = 
      Math.abs(parsed.latitude - latitude) < 0.1 && 
      Math.abs(parsed.longitude - longitude) < 0.1;

    if (isExpired || !isSameLocation) {
      localStorage.removeItem(CLINICS_CACHE_KEY);
      return null;
    }

    console.log("✅ Usando clínicas desde caché (edad:", Math.round((now - parsed.timestamp) / 1000), "seg)");
    return parsed.data;
  } catch (error) {
    console.warn("Error al leer caché:", error);
    return null;
  }
}

function setCachedClinics(clinics: typeof CLINIC_CATALOG, latitude: number, longitude: number): void {
  try {
    if (typeof window === "undefined") return;
    
    const cache: ClinicsCache = {
      data: clinics,
      timestamp: Date.now(),
      latitude,
      longitude,
    };
    localStorage.setItem(CLINICS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Error al guardar caché:", error);
  }
}

export default function ClinicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthState();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const [page, setPage] = useState(1);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [clinicsData, setClinicsData] = useState<typeof CLINIC_CATALOG>(CLINIC_CATALOG);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [failedMaps, setFailedMaps] = useState<Set<string>>(new Set());
  
  // Estados para el modal de clínica individual
  const [selectedClinic, setSelectedClinic] = useState<typeof CLINIC_CATALOG[0] | null>(null);
  const [showClinicDetail, setShowClinicDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Handler para cuando una imagen falla
  const handleImageError = (clinicId: string) => {
    setFailedImages(prev => new Set([...prev, clinicId]));
  };

  // Solicitar geolocalización y cargar clínicas cercanas
  useEffect(() => {
    const loadNearByClinics = async () => {
      try {
        // Pedir permiso de geolocalización
        if (!navigator.geolocation) {
          setLocationError("Tu navegador no soporta geolocalización");
          return;
        }

        console.log("🔄 Solicitando permiso de geolocalización...");

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`✅ Permiso CONCEDIDO. Ubicación: ${latitude}, ${longitude}`);
            
            // ✅ NUEVO: Verificar si hay caché válido
            const cachedClinics = getCachedClinics(latitude, longitude);
            if (cachedClinics && cachedClinics.length > 0) {
              console.log(`✅ Clinicas cargadas desde caché (${cachedClinics.length} resultados)`);
              setClinicsData(cachedClinics);
              setLoading(false);
              return;
            }
            
            // Ahora SÍ mostrar loading, después de que se concedió el permiso
            setLoading(true);
            setLoadingMessage("Buscando veterinarias cerca...");
            
            // Buscar clínicas cercanas
            const nearbyClinics = await searchNearByClinics(latitude, longitude, 10);
            console.log(`📡 Respuesta API completa:`, nearbyClinics);
            console.log(`📡 Respuesta API: ${nearbyClinics?.length || 0} clínicas`);
            console.log(`📡 Tipos de datos:`, nearbyClinics?.[0]);
            
            if (nearbyClinics && nearbyClinics.length > 0) {
              console.log(`✅ Encontradas ${nearbyClinics.length} veterinarias cercanas`);
              console.log(`📍 Primer clinic:`, nearbyClinics[0]);
              setClinicsData(nearbyClinics);
              // ✅ NUEVO: Guardar en caché
              setCachedClinics(nearbyClinics, latitude, longitude);
              setLoading(false);
            } else {
              console.log("⚠️ No se encontraron veterinarias cercanas en API");
              console.log("📍 Usando fallback de clinicas locales...");
              setLocationError("Mostrando veterinarias cercanas disponibles");
              // Mantener el CLINIC_CATALOG inicial como fallback - NO cambiar clinicsData
              setLoading(false);
            }
          },
          (error) => {
            console.warn(`❌ Permiso DENEGADO o error: ${error.message} (código: ${error.code})`);
            let errorMsg = "No se pudo obtener tu ubicación";
            
            if (error.code === 1) {
              errorMsg = "Permiso de ubicación denegado. Habilítalo en la configuración del navegador.";
            } else if (error.code === 2) {
              errorMsg = "No se pudo determinar tu ubicación. Intenta nuevamente.";
            } else if (error.code === 3) {
              errorMsg = "La solicitud de ubicación tardó demasiado.";
            }
            
            setLocationError(errorMsg);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } catch (error) {
        console.error("❌ Error inesperado:", error);
        setLocationError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    };

    loadNearByClinics();
  }, []);

  // Merge platform-registered (APPROVED) clinics with the catalog
  useEffect(() => {
    fetchPlatformClinics().then(({ clinics }) => {
      if (clinics.length === 0) return;
      setClinicsData((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newOnes = clinics.filter((c) => !existingIds.has(c.id));
        return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
      });
    });
  }, []);

  // Preseleccionar ciudad desde URL si viene en los params
  useEffect(() => {
    const cityParam = searchParams.get("city");
    if (cityParam && ["Bogota", "Medellin", "Cali"].includes(cityParam)) {
      setSelectedCity(cityParam);
    }
  }, [searchParams]);

  const cityOptions = useMemo(
    () => ["all", ...new Set(clinicsData.map((item) => item.city))],
    [clinicsData]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const base = clinicsData.filter((item) => {
      const matchesCity = selectedCity === "all" || item.city === selectedCity;
      const matchesOpenNow = !openNowOnly || item.openNow;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.neighborhood.toLowerCase().includes(normalizedQuery) ||
        item.services.some((service) => service.toLowerCase().includes(normalizedQuery));

      return matchesCity && matchesOpenNow && matchesQuery;
    });

    const sorted = [...base].sort((a, b) => {
      if (sortMode === "rating") {
        return b.rating - a.rating;
      }
      return a.distanceKm - b.distanceKm;
    });

    return sorted;
  }, [openNowOnly, query, selectedCity, sortMode, clinicsData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * CATALOG_PAGE_SIZE,
    safePage * CATALOG_PAGE_SIZE
  );
  const openNowCount = filtered.filter((item) => item.openNow).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATIONS.base / 1000 },
    },
  };

  // Re-animar cuando las clínicas cambian
  const animationKey = useMemo(() => clinicsData.map(c => c.id).join(','), [clinicsData]);

  return (
    <main className="overflow-hidden">
      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-secondary/30 border-t-secondary rounded-full"
            />
            <p className="text-white text-center text-sm font-medium">{loadingMessage}</p>
          </motion.div>
        </motion.div>
      )}


      {/* Clinic Booking Modal */}
      <AnimatePresence>
        {selectedClinic && showBookingModal && (
          <ClinicBookingModal
            isOpen={true}
            clinic={selectedClinic}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Clinic Detail Modal */}
      <AnimatePresence>
        {selectedClinic && showClinicDetail && (
          <ClinicDetailModal
            clinic={{
              ...selectedClinic,
              distanceKm: selectedClinic.distanceKm || 0,
            }}
            onClose={() => setShowClinicDetail(false)}
            onReservar={() => {
              setShowClinicDetail(false);
              setShowBookingModal(true);
            }}
          />
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden pt-24 pb-10">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATIONS.base / 1000 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-secondary/20 border-secondary/50 inline-flex items-center gap-1.5">
              <Building2 size={14} />
              Directorio Premium
            </Badge>

            <h1 className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-bold mb-4",
              "bg-gradient-to-r from-secondary-500 via-primary-400 to-accent-500",
              "bg-clip-text text-transparent"
            )}>
              Encuentra Tu Veterinaria Ideal
            </h1>

            <p className="text-lg text-text-secondary max-w-xl mx-auto">
              Clínicas verificadas cerca de ti, con precios, horarios y reseñas reales
            </p>

            {user?.role === 'ADMIN' && (
              <div className="mt-4">
                <Link href="/admin/clinics">
                  <Badge className="px-4 py-1.5 bg-secondary/10 border-secondary/50 hover:bg-secondary/20 cursor-pointer transition-all inline-block">
                    🔧 Panel de Administración
                  </Badge>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: DURATIONS.base / 1000 }}
            className="flex items-center justify-center gap-6 flex-wrap"
          >
            {[
              { value: filtered.length, label: "Clínicas" },
              { value: openNowCount, label: "Abiertas ahora" },
              { value: `${totalPages * CATALOG_PAGE_SIZE}+`, label: "Reseñas" },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
                <span className="text-sm text-text-tertiary">{stat.label}</span>
                {idx < 2 && <span className="w-1 h-1 rounded-full bg-border ml-2" />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Location warning banner — inline, below hero */}
      {locationError && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-0"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 text-sm">
            <span className="text-warning shrink-0">📍</span>
            <p className="text-text-secondary flex-1">{locationError}</p>
          </div>
        </motion.div>
      )}

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATIONS.base / 1000 }}
          viewport={{ once: true }}
          className={cn(
            "px-4 py-3 rounded-2xl border border-border/30",
            "bg-surface/70 backdrop-blur-sm",
            "flex flex-wrap items-center gap-3"
          )}
        >
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary size-4" />
            <Input
              placeholder="Busca clínica, zona o servicio..."
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              className="pl-9 h-9 text-sm"
              variant="default"
            />
          </div>

          {/* City Select */}
          <select
            value={selectedCity}
            onChange={(e) => { setPage(1); setSelectedCity(e.target.value); }}
            className={cn(
              "px-3 py-2 rounded-lg border transition-all h-9",
              "bg-surface border-border/30 text-text-primary",
              "hover:border-secondary/50 text-sm font-medium"
            )}
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city === "all" ? "Todas las ciudades" : city}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className={cn(
              "px-3 py-2 rounded-lg border transition-all h-9",
              "bg-surface border-border/30 text-text-primary",
              "hover:border-secondary/50 text-sm font-medium"
            )}
          >
            <option value="rating">Mejor rating</option>
            <option value="distance">Más cercanas</option>
          </select>

          {/* Open Now Toggle */}
          <label className={cn(
            "px-3 py-2 h-9 rounded-lg border cursor-pointer transition-all flex items-center gap-2",
            openNowOnly
              ? "bg-success/10 border-success/40 text-success"
              : "bg-surface border-border/30 text-text-secondary hover:border-secondary/50",
            "text-sm font-medium whitespace-nowrap"
          )}>
            <input
              type="checkbox"
              checked={openNowOnly}
              onChange={(e) => { setPage(1); setOpenNowOnly(e.target.checked); }}
              className="sr-only"
            />
            <span className={cn(
              "w-2 h-2 rounded-full",
              openNowOnly ? "bg-success" : "bg-text-tertiary/40"
            )} />
            Abiertas ahora
          </label>

          {/* Results count */}
          <span className="ml-auto text-xs text-text-tertiary whitespace-nowrap hidden sm:block">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </span>
        </motion.div>
      </section>

      {/* Clinics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {paginated.length > 0 ? (
          <>
            <motion.div
              key={animationKey}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginated.map((clinic) => (
                <motion.div key={clinic.id} variants={itemVariants}>
                  <Card 
                    className="overflow-hidden group h-full flex flex-col hover:border-secondary/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedClinic(clinic);
                      setShowClinicDetail(true);
                    }}
                  >
                    {/* Map / Image Container */}
                    {(() => {
                      const staticMapUrl = getStaticMapUrl(clinic.latitude, clinic.longitude);
                      const mapFailed = failedMaps.has(clinic.id);
                      const imgFailed = failedImages.has(clinic.id);
                      const showMap = staticMapUrl && !mapFailed;

                      return (
                        <div className="relative overflow-hidden h-48 bg-gradient-to-br from-secondary/20 to-accent/20">
                          {showMap ? (
                            /* Static map as main visual */
                            <Image
                              src={staticMapUrl}
                              alt={`Ubicación de ${clinic.name}`}
                              width={600}
                              height={300}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={() =>
                                setFailedMaps((prev) => new Set([...prev, clinic.id]))
                              }
                              unoptimized
                            />
                          ) : imgFailed ? (
                            /* Both failed — location fallback */
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary/10 to-accent/10">
                              <Building2 size={40} className="text-text-tertiary/50" />
                              <div className="text-center px-4">
                                <p className="text-xs font-semibold text-text-secondary">{clinic.neighborhood}</p>
                                <p className="text-xs text-text-tertiary">{clinic.city}</p>
                              </div>
                            </div>
                          ) : (
                            /* No API key or map failed — show clinic photo */
                            <Image
                              src={clinic.image}
                              alt={clinic.name}
                              width={1200}
                              height={600}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() => handleImageError(clinic.id)}
                              loading="lazy"
                              unoptimized
                            />
                          )}

                          {/* Clinic photo thumbnail overlay (when map is showing) */}
                          {showMap && !imgFailed && (
                            <div className="absolute bottom-2 left-2 w-14 h-14 rounded-lg overflow-hidden border-2 border-white/80 shadow-md">
                              <Image
                                src={clinic.image}
                                alt={clinic.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(clinic.id)}
                                loading="lazy"
                                unoptimized
                              />
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
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
                            {clinic.source === "platform" && (
                              <Badge className="px-2 py-0.5 bg-primary-600/90 text-white border-primary-500 text-xs">
                                🐾 PetQuotes
                              </Badge>
                            )}
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })()}

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="mb-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-text-primary leading-tight">
                            {clinic.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 mt-0.5">
                            <Star size={14} className="text-warning fill-warning" />
                            <span className="text-sm font-bold text-text-primary">
                              {clinic.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin size={12} className="text-secondary shrink-0" />
                          <p className="text-xs text-text-tertiary">
                            {clinic.neighborhood}, {clinic.city} · {clinic.distanceKm.toFixed(1)} km
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-tertiary mb-4 line-clamp-2 leading-relaxed">
                        {clinic.description}
                      </p>

                      {/* Services */}
                      <div className="flex-1 mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {clinic.services.slice(0, 3).map((service) => (
                            <span
                              key={service}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20"
                            >
                              {service}
                            </span>
                          ))}
                          {clinic.services.length > 3 && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface border border-border/30 text-text-tertiary">
                              +{clinic.services.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-3 border-t border-border/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-tertiary">
                            {clinic.openNow ? "Abierta ahora" : "Cerrada"}
                          </span>
                          <span className="text-xs font-semibold text-secondary group-hover:underline">
                            Ver detalles →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: DURATIONS.base / 1000 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-4 mt-12"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="gap-2"
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>

              <div className={cn(
                "px-4 py-2 rounded-lg",
                "bg-surface border border-border/30",
                "text-sm font-semibold text-text-primary"
              )}>
                Página {safePage} de {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="gap-2"
              >
                Siguiente
                <ChevronRight size={16} />
              </Button>
            </motion.div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: DURATIONS.base / 1000 }}
            viewport={{ once: true }}
            className={cn(
              "text-center py-16 rounded-2xl",
              "bg-surface border border-border/30"
            )}
          >
            <Building2 size={48} className="mx-auto text-text-tertiary mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-text-primary mb-2">
              No encontramos clínicas
            </h3>
            <p className="text-text-secondary mb-6">
              Intenta con otros filtros o búsqueda
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setQuery("");
                setSelectedCity("all");
                setOpenNowOnly(false);
                setPage(1);
              }}
            >
              Limpiar Filtros
            </Button>
          </motion.div>
        )}
      </section>
    </main>
  );
}

