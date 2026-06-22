"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, PawPrint } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card } from "@/components/ui/card";
import { getActivityEvents } from "@/lib/activity-log";
import { listAppointmentsByPet } from "@/lib/api";
import { useAuthState } from "@/store/auth-state";
import { listPetsByOwner } from "@/lib/booking-options";

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  source: "local" | "backend";
};

export default function ActivityPage() {
  const { user } = useAuthState();
  const petOptions = useMemo(() => listPetsByOwner(user?.id), [user?.id]);
  const [petId, setPetId] = useState("");

  useEffect(() => {
    if (!petOptions.some((pet) => pet.id === petId)) {
      setPetId(petOptions[0]?.id ?? "");
    }
  }, [petId, petOptions]);

  const historyQuery = useQuery({
    queryKey: ["activity-appointments", petId],
    queryFn: () => listAppointmentsByPet(petId),
    enabled: Boolean(petId)
  });

  const timeline = useMemo(() => {
    const local = getActivityEvents().map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      createdAt: event.createdAt,
      source: event.source
    } satisfies TimelineItem));

    const backend = (historyQuery.data ?? []).map((appointment) => ({
      id: `apt_${appointment.id}`,
      title: "Reserva registrada",
      description: `Cita ${appointment.id} · Estado ${appointment.status ?? "PENDING"}`,
      createdAt: appointment.startsAt,
      source: "backend"
    } satisfies TimelineItem));

    return [...local, ...backend].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [historyQuery.data]);

  const backendCount = timeline.filter((item) => item.source === "backend").length;
  const localCount = timeline.filter((item) => item.source === "local").length;

  return (
    <AuthGuard>
      <main className="page-container py-4">
        <section className="surface p-6 md:p-7">
          <h1 className="text-3xl font-extrabold text-navy md:text-4xl">Actividad reciente</h1>
          <p className="mt-2 text-soft">Sigue en una sola vista los cambios de perfil, preferencias y reservas.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><Activity className="h-4 w-4 text-brand" />Eventos totales</p>
              <p className="mt-1 text-sm text-soft">{timeline.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><Database className="h-4 w-4 text-brand" />Eventos backend</p>
              <p className="mt-1 text-sm text-soft">{backendCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy"><PawPrint className="h-4 w-4 text-brand" />Eventos locales</p>
              <p className="mt-1 text-sm text-soft">{localCount}</p>
            </div>
          </div>
        </section>

        <Card className="mt-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm text-soft">
              Mascota para eventos de reserva
              <select
                className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-text-primary"
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
              >
                {petOptions.length === 0 && <option value="">Sin mascotas</option>}
                {petOptions.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {historyQuery.isLoading && <p className="mt-3 text-sm text-soft">Cargando reservas recientes...</p>}
          {historyQuery.isError && <p className="mt-3 text-sm text-red-600">No pudimos cargar el historial del backend.</p>}

          <div className="mt-4 grid gap-3">
            {timeline.length === 0 && <p className="text-sm text-soft">Aun no hay eventos para mostrar.</p>}

            {timeline.map((event) => (
              <article key={event.id} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-navy">{event.title}</h2>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${event.source === "backend" ? "bg-sky text-navy" : "bg-accent/70 text-navy"}`}>
                    {event.source === "backend" ? "Backend" : "Local"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-soft">{event.description}</p>
                <p className="mt-2 text-xs text-soft">{new Date(event.createdAt).toLocaleString("es-CO")}</p>
              </article>
            ))}
          </div>
        </Card>
      </main>
    </AuthGuard>
  );
}
