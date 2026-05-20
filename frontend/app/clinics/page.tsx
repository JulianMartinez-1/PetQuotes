"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  SlidersHorizontal,
  Search,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATALOG_PAGE_SIZE, CLINIC_CATALOG } from "@/lib/clinic-catalog";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

type SortMode = "rating" | "distance";

export default function ClinicsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const [page, setPage] = useState(1);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const cityOptions = useMemo(
    () => ["all", ...new Set(CLINIC_CATALOG.map((item) => item.city))],
    []
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const base = CLINIC_CATALOG.filter((item) => {
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
  }, [openNowOnly, query, selectedCity, sortMode]);

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

  return (
    <main className="overflow-hidden">
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
              "text-5xl sm:text-6xl font-bold mb-6",
              "bg-gradient-to-r from-secondary via-foreground to-accent",
              "bg-clip-text text-transparent"
            )}>
              Encuentra Tu Veterinaria Ideal
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Compara clínicas verificadas, compara precios y disponibilidad con total confianza
            </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginated.map((clinic) => (
                <motion.div key={clinic.id} variants={itemVariants}>
                  <Card className="overflow-hidden group h-full flex flex-col hover:border-secondary/50 transition-all">
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-48">
                      <Image
                        src={clinic.image}
                        alt={clinic.name}
                        width={1200}
                        height={600}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
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

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

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

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setNavigatingTo(clinic.id);
                            router.push(`/clinics/${clinic.id}` as Route);
                          }}
                          disabled={navigatingTo === clinic.id}
                        >
                          {navigatingTo === clinic.id ? "Abriendo..." : "Ver Ficha"}
                        </Button>
                        <Link href="/bookings" className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full">
                            Reservar
                          </Button>
                        </Link>
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

