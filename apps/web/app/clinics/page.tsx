"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATALOG_PAGE_SIZE, CLINIC_CATALOG } from "@/lib/clinic-catalog";

type SortMode = "rating" | "distance";

export default function ClinicsPage() {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const [page, setPage] = useState(1);

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
  const paginated = filtered.slice((safePage - 1) * CATALOG_PAGE_SIZE, safePage * CATALOG_PAGE_SIZE);

  return (
    <main className="page-container py-4">
      <section className="surface p-5 md:p-6">
        <h1 className="text-3xl font-extrabold text-navy">Catálogo de clínicas</h1>
        <p className="mt-2 text-sm text-soft">Explora, filtra y compara clínicas antes de reservar.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Buscar por clínica, zona o servicio"
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
          />

          <select
            value={selectedCity}
            onChange={(event) => {
              setPage(1);
              setSelectedCity(event.target.value);
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm"
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city === "all" ? "Todas las ciudades" : city}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm"
          >
            <option value="rating">Ordenar por rating</option>
            <option value="distance">Ordenar por distancia</option>
          </select>

          <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm">
            <input
              type="checkbox"
              checked={openNowOnly}
              onChange={(event) => {
                setPage(1);
                setOpenNowOnly(event.target.checked);
              }}
            />
            Solo abiertas ahora
          </label>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {paginated.map((clinic) => (
          <Card key={clinic.id} className="overflow-hidden p-0">
            <Image src={clinic.image} alt={clinic.name} width={1200} height={700} className="h-44 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-navy">{clinic.name}</h2>
                  <p className="text-sm text-soft">{clinic.city} · {clinic.neighborhood}</p>
                </div>
                <span className="rounded-md bg-sky px-2 py-1 text-xs font-semibold text-navy">{clinic.openNow ? "Abierta" : "Cerrada"}</span>
              </div>

              <p className="mt-3 text-sm text-soft">{clinic.description}</p>
              <p className="mt-3 text-sm font-semibold text-navy">⭐ {clinic.rating} · {clinic.distanceKm.toFixed(1)} km</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {clinic.services.map((service) => (
                  <span key={service} className="rounded-full bg-sky px-2 py-1 text-xs font-medium text-navy">
                    {service}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/clinics/${clinic.id}` as Route}>
                  <Button>Ver detalle</Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="secondary">Reservar</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-6 flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-sm text-soft">
          Mostrando {paginated.length} de {filtered.length} resultados.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={safePage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            Anterior
          </Button>
          <span className="text-sm font-semibold text-navy">{safePage} / {totalPages}</span>
          <Button variant="ghost" disabled={safePage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
            Siguiente
          </Button>
        </div>
      </section>
    </main>
  );
}
