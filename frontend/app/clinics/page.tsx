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
import { searchNearByClinics } from "@/lib/clinics-api";
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
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-16 pb-12">
        {/* Background Gradients */}
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-transparent to-transparent" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATIONS.base / 1000 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2 bg-secondary/20 border-secondary/50 inline-block">
              <Building2 size={16} className="inline mr-2" />
              Directorio Premium
            </Badge>

            <h1 className={cn(
              "text-3xl sm:text-5xl lg:text-6xl font-bold mb-6",
              "bg-gradient-to-r from-secondary-500 via-primary-400 to-accent-500",
              "bg-clip-text text-transparent"
            )}>
              Encuentra Tu Veterinaria Ideal
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Compara clínicas verificadas, compara precios y disponibilidad con total confianza
            </p>

            {/* Admin Link — only for admins */}
            {user?.role === 'ADMIN' && (
              <div className="mt-6">
                <Link href="/admin/clinics">
                  <Badge className="px-4 py-2 bg-secondary/10 border-secondary/50 hover:bg-secondary/20 cursor-pointer transition-all inline-block">
                    🔧 Panel de Administración
                  </Badge>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: DURATIONS.base / 1000 }}
            className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
          >
            {[
              { value: filtered.length, label: "Clínicas" },
              { value: openNowCount, label: "Abiertas Ahora" },
              { value: totalPages, label: "Páginas" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className={cn(
                  "p-4 rounded-xl text-center",
                  "bg-surface border border-border/30",
                  "hover:border-secondary/50 transition-all"
                )}
              >
                <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                <div className="text-xs text-text-tertiary mt-1">{stat.label}</div>
              </motion.div>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATIONS.base / 1000 }}
          viewport={{ once: true }}
          className={cn(
            "p-6 rounded-2xl border border-border/30",
            "bg-surface/50 backdrop-blur-sm"
          )}
        >
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal size={20} className="text-secondary" />
            <h2 className="text-lg font-bold text-text-primary">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 size-5" />
              <Input
                placeholder="Busca clínica, zona o servicio..."
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setQuery(e.target.value);
                }}
                className="pl-12"
                variant="default"
              />
            </div>

            {/* City Select */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setPage(1);
                setSelectedCity(e.target.value);
              }}
              className={cn(
                "px-4 py-3 rounded-lg border transition-all",
                "bg-surface border-border/30 text-text-primary",
                "hover:border-secondary/50 focus:border-secondary focus:ring-secondary/20",
                "text-sm font-medium"
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
                "px-4 py-3 rounded-lg border transition-all",
                "bg-surface border-border/30 text-text-primary",
                "hover:border-secondary/50 focus:border-secondary focus:ring-secondary/20",
                "text-sm font-medium"
              )}
            >
              <option value="rating">Por Rating</option>
              <option value="distance">Por Cercania</option>
            </select>

            {/* Open Now Checkbox */}
            <label className={cn(
              "px-4 py-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3",
              "bg-surface border-border/30 hover:border-secondary/50",
              "text-sm font-medium"
            )}>
              <input
                type="checkbox"
                checked={openNowOnly}
                onChange={(e) => {
                  setPage(1);
                  setOpenNowOnly(e.target.checked);
                }}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span>Abiertas Ahora</span>
            </label>
          </div>
        </motion.div>
      </section>

      {/* Clinics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                            /* Both failed — icon fallback */
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/10 to-accent/10">
                              <Building2 size={48} className="text-text-tertiary/50" />
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
                              />
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
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

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })()}

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-text-primary mb-1">
                          {clinic.name}
                        </h3>
                        <p className="text-sm text-text-tertiary">
                          {clinic.city} • {clinic.neighborhood}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {clinic.description}
                      </p>

                      {/* Rating & Distance */}
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/30">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-warning fill-warning" />
                          <span className="font-semibold text-text-primary">
                            {clinic.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-text-secondary">
                          <MapPin size={16} className="text-secondary" />
                          <span className="text-sm">{clinic.distanceKm.toFixed(1)} km</span>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mb-6 flex-1">
                        <p className="text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wide">
                          Servicios
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {clinic.services.slice(0, 3).map((service) => (
                            <Badge
                              key={service}
                              className="bg-secondary/10 border-secondary/30 text-secondary text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                          {clinic.services.length > 3 && (
                            <Badge className="bg-surface border-border/30 text-text-tertiary text-xs">
                              +{clinic.services.length - 3}
                            </Badge>
                          )}
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

