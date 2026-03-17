"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getActivityEvents } from "@/lib/activity-log";
import { listAppointmentsByPet } from "@/lib/api";

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  source: "local" | "backend";
};

export default function ActivityPage() {
  const [petId, setPetId] = useState("pet-demo-1");

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

  return (
    <AuthGuard>
      <main className="page-container py-4">
        <h1 className="text-3xl font-extrabold text-navy">Actividad reciente</h1>
        <p className="mt-2 text-soft">Últimos cambios de perfil, preferencias y reservas.</p>

        <Card className="mt-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm text-soft">
              Mascota para eventos de reserva
              <Input value={petId} onChange={(e) => setPetId(e.target.value)} placeholder="pet-demo-1" />
            </label>
          </div>

          {historyQuery.isLoading && <p className="mt-3 text-sm text-soft">Cargando reservas recientes...</p>}
          {historyQuery.isError && <p className="mt-3 text-sm text-red-600">No se pudo leer historial backend.</p>}

          <div className="mt-4 grid gap-3">
            {timeline.length === 0 && <p className="text-sm text-soft">No hay eventos todavía.</p>}

            {timeline.map((event) => (
              <article key={event.id} className="rounded-xl border border-line bg-white p-3">
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
