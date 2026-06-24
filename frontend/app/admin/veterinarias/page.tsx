"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Stethoscope, Building2, MapPin,
  Phone, Mail, User, ChevronDown, ChevronUp, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getVetRequests, approveVetRequest, rejectVetRequest, VetRequest } from "@/lib/admin-api";

type TabStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_LABELS: Record<TabStatus, string> = {
  PENDING: "Pendientes",
  APPROVED: "Aprobadas",
  REJECTED: "Rechazadas",
};

export default function AdminVeterinariasPage() {
  const [tab, setTab] = useState<TabStatus>("PENDING");
  const [requests, setRequests] = useState<VetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectTarget, setRejectTarget] = useState<VetRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVetRequests(tab);
      setRequests(data);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (req: VetRequest) => {
    setActionLoadingId(req.id);
    try {
      await approveVetRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch {
      // error handled silently; user can retry
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget || rejectReason.trim().length < 10) return;
    setRejectLoading(true);
    try {
      await rejectVetRequest(rejectTarget.id, rejectReason.trim());
      setRequests((prev) => prev.filter((r) => r.id !== rejectTarget.id));
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      // error handled silently
    } finally {
      setRejectLoading(false);
    }
  };

  const typeLabel = (req: VetRequest) =>
    req.veterinaryType === "CLINIC" ? "Clínica" : "Veterinario independiente";

  const entityName = (req: VetRequest) =>
    req.veterinaryType === "CLINIC"
      ? (req.clinic?.name ?? "—")
      : (req.serviceArea ?? "—");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Stethoscope size={24} className="text-primary-600" />
          Solicitudes Veterinarias
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Aprueba o rechaza registros de veterinarias y veterinarios independientes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 border border-border w-fit">
        {(["PENDING", "APPROVED", "REJECTED"] as TabStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === s
                ? "bg-primary-600 text-white shadow"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-1 px-2 py-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
          title="Recargar"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Stethoscope size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay solicitudes {STATUS_LABELS[tab].toLowerCase()} por ahora.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="border border-border rounded-xl bg-surface overflow-hidden"
            >
              {/* Summary row */}
              <button
                className="w-full text-left p-4 flex items-center gap-3 hover:bg-surface-light transition-colors"
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              >
                {req.veterinaryType === "CLINIC" ? (
                  <Building2 size={18} className="text-primary-600 shrink-0" />
                ) : (
                  <Stethoscope size={18} className="text-accent shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary text-sm truncate">
                      {entityName(req)}
                    </span>
                    <Badge className="text-xs px-2 py-0.5 bg-surface-light border border-border text-text-secondary">
                      {typeLabel(req)}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {req.user.fullName} · {req.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-muted hidden sm:block">
                    {new Date(req.createdAt).toLocaleDateString("es-CO")}
                  </span>
                  {expandedId === req.id ? (
                    <ChevronUp size={16} className="text-text-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-text-muted" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {expandedId === req.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                      {/* Applicant info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoRow icon={User} label="Solicitante" value={req.user.fullName} />
                        <InfoRow icon={Mail} label="Email" value={req.user.email} />
                        {req.clinic?.phone && (
                          <InfoRow icon={Phone} label="Teléfono" value={req.clinic.phone} />
                        )}
                        {req.clinic?.branches[0] && (
                          <InfoRow
                            icon={MapPin}
                            label="Ubicación"
                            value={`${req.clinic.branches[0].address}, ${req.clinic.branches[0].city}`}
                          />
                        )}
                        {req.serviceArea && (
                          <InfoRow icon={MapPin} label="Zona de atención" value={req.serviceArea} />
                        )}
                        {req.homeVisits && (
                          <InfoRow icon={Stethoscope} label="Visitas a domicilio" value="Sí" />
                        )}
                      </div>

                      {req.clinic?.description && (
                        <div>
                          <p className="text-xs font-semibold text-text-muted mb-1">Descripción</p>
                          <p className="text-sm text-text-secondary">{req.clinic.description}</p>
                        </div>
                      )}

                      {req.clinic?.services && req.clinic.services.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-text-muted mb-1">Servicios</p>
                          <div className="flex flex-wrap gap-1">
                            {req.clinic.services.map((s) => (
                              <span
                                key={s.category}
                                className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs border border-primary-200"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {req.status === "REJECTED" && req.rejectionReason && (
                        <div className="bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-danger mb-1">Motivo de rechazo</p>
                          <p className="text-sm text-text-secondary">{req.rejectionReason}</p>
                        </div>
                      )}

                      {/* Actions (only for PENDING) */}
                      {tab === "PENDING" && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="gap-1.5 bg-success hover:bg-success/90 text-white"
                            onClick={() => handleApprove(req)}
                            disabled={actionLoadingId === req.id}
                          >
                            {actionLoadingId === req.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-danger border-danger/40 hover:bg-danger/5"
                            onClick={() => { setRejectTarget(req); setRejectReason(""); }}
                            disabled={actionLoadingId === req.id}
                          >
                            <XCircle size={14} />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rejection modal */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setRejectTarget(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md p-6"
            >
              <h2 className="text-lg font-bold text-text-primary mb-1">Rechazar solicitud</h2>
              <p className="text-sm text-text-muted mb-4">
                Escribe el motivo del rechazo para{" "}
                <strong>{rejectTarget.user.fullName}</strong>. Le llegará por email.
              </p>
              <textarea
                rows={4}
                placeholder="Explica el motivo del rechazo (mínimo 10 caracteres)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg border border-border bg-surface-light text-sm text-text-primary",
                  "placeholder:text-text-muted resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger",
                )}
              />
              <p className="mt-1 text-xs text-text-muted">
                {rejectReason.trim().length}/10 mínimo
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleRejectSubmit}
                  disabled={rejectReason.trim().length < 10 || rejectLoading}
                  className="flex-1 bg-danger hover:bg-danger/90 text-white gap-1.5"
                >
                  {rejectLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  Confirmar rechazo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRejectTarget(null)}
                  disabled={rejectLoading}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-text-muted mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
    </div>
  );
}
