"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  PawPrint,
  Building2,
  Stethoscope,
  User,
  Phone,
  Mail,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminAppointment {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  startTime: string;
  notes?: string;
  pet?: { name?: string; species?: string };
  service?: { name: string };
  clinic?: { name: string };
  client?: { id: string; fullName: string; email: string; phone?: string };
  createdAt: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Esperando confirmación",
    className: "bg-warning/15 border-warning/40 text-warning",
    dotClass: "bg-warning",
  },
  CONFIRMED: {
    label: "Confirmada",
    className: "bg-success/15 border-success/40 text-success",
    dotClass: "bg-success",
  },
  COMPLETED: {
    label: "Completada",
    className: "bg-border/30 border-border text-text-secondary",
    dotClass: "bg-text-muted",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-danger/15 border-danger/40 text-danger",
    dotClass: "bg-danger",
  },
};

const STATUS_FILTERS = ["Todas", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type FilterType = (typeof STATUS_FILTERS)[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
        <div className="h-5 bg-border/40 rounded w-48" />
        <div className="h-6 bg-border/40 rounded-full w-32" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 bg-border/20 rounded-xl" />
        <div className="h-12 bg-border/20 rounded-xl" />
        <div className="h-12 bg-border/20 rounded-xl" />
        <div className="h-12 bg-border/20 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminReservasPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("Todas");
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Error al cargar reservas");
      }
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/confirm`, { method: "PATCH" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Error al confirmar");
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CONFIRMED" } : a))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al confirmar");
    } finally {
      setConfirming(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered =
    filter === "Todas" ? appointments : appointments.filter((a) => a.status === filter);

  const counts = {
    PENDING: appointments.filter((a) => a.status === "PENDING").length,
    CONFIRMED: appointments.filter((a) => a.status === "CONFIRMED").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: appointments.filter((a) => a.status === "CANCELLED").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-primary-600" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Panel Admin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Gestión de Reservas</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {appointments.length} reserva{appointments.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-border/40 hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-all disabled:opacity-40"
          aria-label="Actualizar"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Stats */}
      {!isLoading && appointments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Pendientes" count={counts.PENDING} color="text-warning" bg="bg-warning/10" />
          <StatCard label="Confirmadas" count={counts.CONFIRMED} color="text-success" bg="bg-success/10" />
          <StatCard label="Completadas" count={counts.COMPLETED} color="text-text-secondary" bg="bg-border/20" />
          <StatCard label="Canceladas" count={counts.CANCELLED} color="text-danger" bg="bg-danger/10" />
        </div>
      )}

      {/* Filter tabs */}
      {!isLoading && appointments.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all",
                filter === f
                  ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                  : "border-border/40 text-text-secondary hover:border-primary-400 hover:text-primary-700"
              )}
            >
              {f === "Todas"
                ? `Todas (${appointments.length})`
                : f === "PENDING"
                ? `Pendientes (${counts.PENDING})`
                : f === "CONFIRMED"
                ? `Confirmadas (${counts.CONFIRMED})`
                : f === "COMPLETED"
                ? `Completadas (${counts.COMPLETED})`
                : `Canceladas (${counts.CANCELLED})`}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm mb-6"
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

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">
            {filter === "Todas" ? "No hay reservas aún" : `No hay reservas con estado "${filter}"`}
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((appt, i) => (
              <AdminAppointmentCard
                key={appt.id}
                appt={appt}
                index={i}
                isConfirming={confirming === appt.id}
                onConfirm={() => handleConfirm(appt.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  count,
  color,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("rounded-xl p-4 border border-border/20", bg)}>
      <p className={cn("text-2xl font-bold", color)}>{count}</p>
      <p className="text-xs text-text-muted font-semibold mt-0.5">{label}</p>
    </div>
  );
}

function AdminAppointmentCard({
  appt,
  index,
  isConfirming,
  onConfirm,
}: {
  appt: AdminAppointment;
  index: number;
  isConfirming: boolean;
  onConfirm: () => void;
}) {
  const config = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.PENDING;
  const isPending = appt.status === "PENDING";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border bg-surface shadow-sm transition-all p-5",
        isPending
          ? "border-warning/30 hover:border-warning/50 hover:shadow-md"
          : "border-border/30 hover:border-border/50"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-base font-bold text-text-primary capitalize leading-tight">
            {appt.startTime ? formatDate(appt.startTime) : "—"}
          </p>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {appt.startTime ? formatTime(appt.startTime) : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "text-xs font-semibold border px-2.5 py-1 flex items-center gap-1.5 whitespace-nowrap",
              config.className
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClass)} />
            {config.label}
          </Badge>
          {isPending && (
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={isConfirming}
              className="h-7 px-3 text-xs font-bold bg-success hover:bg-success/90 text-white shadow-sm gap-1.5"
            >
              {isConfirming ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <CheckCircle2 size={12} />
              )}
              {isConfirming ? "Confirmando…" : "Confirmar cita"}
            </Button>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DetailCell
          icon={<User size={12} />}
          label="Cliente"
          value={appt.client?.fullName ?? "—"}
          sub={appt.client?.email}
        />
        <DetailCell
          icon={<PawPrint size={12} />}
          label="Mascota"
          value={
            appt.pet?.name
              ? `${appt.pet.name}${appt.pet.species ? ` (${appt.pet.species})` : ""}`
              : "—"
          }
        />
        <DetailCell
          icon={<Stethoscope size={12} />}
          label="Servicio"
          value={appt.service?.name ?? "—"}
        />
        <DetailCell
          icon={<Building2 size={12} />}
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

function DetailCell({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-surface-2 rounded-xl px-3 py-2.5 border border-border/20">
      <p className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-text-primary leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-text-muted truncate mt-0.5">{sub}</p>}
    </div>
  );
}
