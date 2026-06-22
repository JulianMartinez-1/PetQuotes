"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  PawPrint,
  Building2,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/auth/auth-guard";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  startTime: string;
  endTime?: string;
  notes?: string;
  pet?: { name?: string; species?: string; breed?: string };
  service?: { name: string };
  clinic?: { name: string };
  createdAt: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Esperando confirmación",
    icon: AlertCircle,
    className: "bg-warning/15 border-warning/40 text-warning",
    dotClass: "bg-warning",
  },
  CONFIRMED: {
    label: "Confirmada",
    icon: CheckCircle2,
    className: "bg-success/15 border-success/40 text-success",
    dotClass: "bg-success",
  },
  COMPLETED: {
    label: "Completada",
    icon: CheckCircle2,
    className: "bg-border/30 border-border text-text-secondary",
    dotClass: "bg-text-muted",
  },
  CANCELLED: {
    label: "Cancelada",
    icon: XCircle,
    className: "bg-danger/15 border-danger/40 text-danger",
    dotClass: "bg-danger",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/30 bg-surface p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="h-5 bg-border/40 rounded w-40" />
        <div className="h-6 bg-border/40 rounded-full w-32" />
      </div>
      <div className="space-y-2.5">
        <div className="h-4 bg-border/30 rounded w-3/4" />
        <div className="h-4 bg-border/30 rounded w-1/2" />
        <div className="h-4 bg-border/30 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "No se pudieron cargar las reservas");
      }
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const pending = appointments.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED");
  const past = appointments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED");

  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-surface border-b border-border/30 pt-10 pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList size={18} className="text-secondary-500" />
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                    Panel de citas
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-text-primary">Mis Reservas</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Consulta y sigue el estado de todas tus citas veterinarias
                </p>
              </div>
              <button
                onClick={fetchAppointments}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-border/40 hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-all disabled:opacity-40"
                aria-label="Actualizar reservas"
              >
                <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
              <button
                onClick={fetchAppointments}
                className="ml-auto text-xs underline underline-offset-2 font-semibold"
              >
                Reintentar
              </button>
            </motion.div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && appointments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-secondary-50 border-2 border-secondary-100 flex items-center justify-center mx-auto mb-5">
                <PawPrint size={36} className="text-secondary-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Aún no tienes reservas
              </h2>
              <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                Encuentra una clínica veterinaria cerca de ti y agenda tu primera cita en segundos.
              </p>
              <Button onClick={() => router.push("/clinics")}>
                Buscar clínicas
                <ChevronRight size={16} />
              </Button>
            </motion.div>
          )}

          {/* Upcoming / active */}
          {!isLoading && pending.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">
                Próximas citas · {pending.length}
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {pending.map((appt, i) => (
                    <AppointmentCard key={appt.id} appt={appt} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Past */}
          {!isLoading && past.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">
                Historial · {past.length}
              </h2>
              <div className="space-y-3 opacity-75">
                <AnimatePresence>
                  {past.map((appt, i) => (
                    <AppointmentCard key={appt.id} appt={appt} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* CTA */}
          {!isLoading && appointments.length > 0 && (
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => router.push("/clinics")}>
                Agendar otra cita
                <ChevronRight size={15} />
              </Button>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}

function AppointmentCard({ appt, index }: { appt: Appointment; index: number }) {
  const config = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.22, ease: "easeOut" }}
      className="rounded-2xl border border-border/30 bg-surface shadow-sm hover:shadow-md hover:border-secondary-200 transition-all p-5"
    >
      {/* Top row: status + date */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-base font-bold text-text-primary capitalize leading-tight">
            {appt.startTime ? formatDate(appt.startTime) : "—"}
          </p>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {appt.startTime ? formatTime(appt.startTime) : "—"} · hora Colombia
          </p>
        </div>
        <Badge className={cn("text-xs font-semibold border px-2.5 py-1 flex items-center gap-1.5 whitespace-nowrap", config.className)}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClass)} />
          {config.label}
        </Badge>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DetailRow
          icon={<PawPrint size={13} />}
          label="Mascota"
          value={
            appt.pet?.name
              ? `${appt.pet.name}${appt.pet.species ? ` (${appt.pet.species})` : ""}`
              : "—"
          }
        />
        <DetailRow
          icon={<Stethoscope size={13} />}
          label="Servicio"
          value={appt.service?.name ?? "—"}
        />
        <DetailRow
          icon={<Building2 size={13} />}
          label="Clínica"
          value={appt.clinic?.name ?? "—"}
        />
      </div>

      {appt.notes && (
        <p className="mt-3 text-xs text-text-secondary bg-surface-2 rounded-lg px-3 py-2 border border-border/20">
          📝 {appt.notes}
        </p>
      )}
    </motion.article>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-text-muted mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}
