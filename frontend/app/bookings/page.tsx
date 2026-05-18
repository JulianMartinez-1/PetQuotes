"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { createAppointment, listAppointmentsByPet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/auth/auth-guard";
import { addActivityEvent } from "@/lib/activity-log";
import { useAuthState } from "@/store/auth-state";
import {
  BOOKING_BRANCHES,
  BOOKING_SERVICES,
  BOOKING_VETS,
  listPetsByOwner,
} from "@/lib/booking-options";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

const SLOT_OPTIONS = ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"];

export default function BookingsPage() {
  const { user } = useAuthState();
  const queryClient = useQueryClient();
  const tomorrow = useMemo(() => {
    const date = new Date(Date.now() + 86_400_000);
    return date.toISOString().slice(0, 10);
  }, []);

  const availablePets = useMemo(() => listPetsByOwner(user?.id), [user?.id]);
  const defaultPetId = availablePets[0]?.id ?? "";

  const [form, setForm] = useState({
    clientId: "",
    petId: "",
    veterinarianId: BOOKING_VETS[0]?.id ?? "",
    serviceId: BOOKING_SERVICES[0]?.id ?? "",
    branchId: BOOKING_BRANCHES[0]?.id ?? "",
    startsAtDate: tomorrow,
    startsAtTime: SLOT_OPTIONS[1],
    notes: "Control anual",
  });

  useEffect(() => {
    setForm((state) => {
      const nextClientId = user?.id ?? "";
      const petStillAvailable = availablePets.some((pet) => pet.id === state.petId);
      const nextPetId = petStillAvailable ? state.petId : defaultPetId;

      if (state.clientId === nextClientId && state.petId === nextPetId) {
        return state;
      }

      return {
        ...state,
        clientId: nextClientId,
        petId: nextPetId,
      };
    });
  }, [availablePets, defaultPetId, user?.id]);

  const historyQuery = useQuery({
    queryKey: ["appointments-history", form.petId],
    queryFn: () => listAppointmentsByPet(form.petId),
    enabled: Boolean(form.petId),
  });

  const mutation = useMutation({
    mutationFn: () => {
      const appointmentIso = `${form.startsAtDate}T${form.startsAtTime}:00.000Z`;
      return createAppointment({
        clientId: form.clientId,
        petId: form.petId,
        veterinarianId: form.veterinarianId,
        serviceId: form.serviceId,
        branchId: form.branchId,
        startsAt: new Date(appointmentIso).toISOString(),
        notes: form.notes,
      });
    },
    onSuccess: async () => {
      addActivityEvent({
        type: "booking-created",
        title: "Reserva creada",
        description: `Nueva cita para ${form.petId} el ${form.startsAtDate} a las ${form.startsAtTime}.`,
      });
      await queryClient.invalidateQueries({
        queryKey: ["appointments-history", form.petId],
      });
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mutation.mutateAsync();
  };

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
    <AuthGuard>
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-16 pb-12">
          {/* Background Gradients */}
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute top-20 left-10 w-96 h-96 bg-cyan/15 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-magenta/15 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-transparent to-transparent" />
          </motion.div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATIONS.base / 1000 }}
            >
              <h1 className={cn(
                "text-5xl sm:text-6xl font-bold mb-6",
                "bg-gradient-to-r from-cyan via-text-primary to-magenta",
                "bg-clip-text text-transparent"
              )}>
                Reserva Tu Cita
              </h1>

              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Elige fecha, hora y servicio. Confirma en un clic y monitorea tu mascota.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Form Card */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <h2 className={cn(
                  "text-2xl font-bold mb-6",
                  "bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent"
                )}>
                  Datos de la Reserva
                </h2>

                {availablePets.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-6 rounded-lg text-center",
                      "bg-danger/10 border border-danger/30"
                    )}
                  >
                    <AlertCircle className="mx-auto mb-3 text-danger" size={32} />
                    <p className="text-danger font-semibold mb-2">
                      No hay mascotas registradas
                    </p>
                    <p className="text-danger/70 text-sm">
                      Necesitas registrar una mascota para hacer reservas
                    </p>
                  </motion.div>
                ) : (
                  <form className="space-y-6" onSubmit={onSubmit}>
                    {/* Pet Selection */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-semibold text-text-primary">
                        🐾 Tu Mascota
                      </label>
                      <select
                        value={form.petId}
                        onChange={(e) => setForm((s) => ({ ...s, petId: e.target.value }))}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-all",
                          "bg-surface border-border/30 text-text-primary",
                          "hover:border-cyan/50 focus:border-cyan focus:ring-cyan/20",
                          "text-sm font-medium"
                        )}
                        required
                      >
                        <option value="" disabled>
                          Selecciona una mascota
                        </option>
                        {availablePets.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.name} ({pet.species})
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    {/* Veterinarian Selection */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-semibold text-text-primary">
                        👨‍⚕️ Veterinario
                      </label>
                      <select
                        value={form.veterinarianId}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, veterinarianId: e.target.value }))
                        }
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-all",
                          "bg-surface border-border/30 text-text-primary",
                          "hover:border-cyan/50 focus:border-cyan focus:ring-cyan/20",
                          "text-sm font-medium"
                        )}
                        required
                      >
                        {BOOKING_VETS.map((vet) => (
                          <option key={vet.id} value={vet.id}>
                            {vet.name} ({vet.specialty})
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    {/* Service Selection */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-semibold text-text-primary">
                        💉 Servicio
                      </label>
                      <select
                        value={form.serviceId}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, serviceId: e.target.value }))
                        }
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-all",
                          "bg-surface border-border/30 text-text-primary",
                          "hover:border-cyan/50 focus:border-cyan focus:ring-cyan/20",
                          "text-sm font-medium"
                        )}
                        required
                      >
                        {BOOKING_SERVICES.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    {/* Branch Selection */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-semibold text-text-primary">
                        🏥 Sede
                      </label>
                      <select
                        value={form.branchId}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, branchId: e.target.value }))
                        }
                        className={cn(
                          "w-full px-4 py-3 rounded-lg border transition-all",
                          "bg-surface border-border/30 text-text-primary",
                          "hover:border-cyan/50 focus:border-cyan focus:ring-cyan/20",
                          "text-sm font-medium"
                        )}
                        required
                      >
                        {BOOKING_BRANCHES.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.label}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    {/* Date Selection */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-semibold text-text-primary">
                        📅 Fecha
                      </label>
                      <Input
                        type="date"
                        value={form.startsAtDate}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, startsAtDate: e.target.value }))
                        }
                        variant="default"
                        required
                      />
                    </motion.div>

                    {/* Time Selection */}
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="block text-sm font-semibold text-text-primary">
                        ⏰ Horarios Disponibles
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {SLOT_OPTIONS.map((slot) => (
                          <motion.button
                            key={slot}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setForm((s) => ({ ...s, startsAtTime: slot }))
                            }
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm font-semibold transition-all",
                              form.startsAtTime === slot
                                ? "border-cyan bg-cyan/20 text-cyan"
                                : "border-border/30 bg-surface hover:border-cyan/50"
                            )}
                          >
                            {slot}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Notes */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-semibold text-text-primary">
                        📝 Notas (Opcional)
                      </label>
                      <Input
                        placeholder="Información adicional para la clínica..."
                        value={form.notes}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, notes: e.target.value }))
                        }
                        variant="default"
                      />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={mutation.isPending}
                        className="w-full group"
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader
                              size={18}
                              className="mr-2 animate-spin"
                            />
                            Confirmando reserva...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} className="mr-2" />
                            Confirmar Cita
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Status Messages */}
                    {mutation.isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-lg border",
                          "bg-success/10 border-success/30 text-success text-sm font-semibold"
                        )}
                      >
                        ✓ Reserva confirmada con éxito
                      </motion.div>
                    )}

                    {mutation.isError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-lg border",
                          "bg-danger/10 border-danger/30 text-danger text-sm"
                        )}
                      >
                        {(mutation.error as Error).message}
                      </motion.div>
                    )}
                  </form>
                )}
              </Card>
            </motion.div>

            {/* Summary Card */}
            <motion.div variants={itemVariants}>
              <Card className="sticky top-24">
                <h3 className={cn(
                  "text-lg font-bold mb-6",
                  "bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent"
                )}>
                  Resumen
                </h3>

                <div className="space-y-4">
                  {[
                    { label: "Mascota", value: form.petId || "—" },
                    { label: "Veterinario", value: form.veterinarianId || "—" },
                    { label: "Servicio", value: form.serviceId || "—" },
                    { label: "Sede", value: form.branchId || "—" },
                    { label: "Fecha", value: form.startsAtDate || "—" },
                    { label: "Hora", value: form.startsAtTime || "—" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      className="pb-4 border-b border-border/30 last:border-0 last:pb-0"
                    >
                      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-text-primary break-words">
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {mutation.isSuccess && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "mt-6 p-4 rounded-lg",
                      "bg-success/10 border border-success/30 text-center"
                    )}
                  >
                    <CheckCircle className="mx-auto mb-2 text-success" size={24} />
                    <p className="text-sm font-semibold text-success">
                      ¡Cita Reservada!
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </motion.div>

          {/* History Section */}
          {form.petId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: DURATIONS.base / 1000 }}
              viewport={{ once: true }}
              className="mt-12"
            >
              <Card>
                <h3 className={cn(
                  "text-2xl font-bold mb-6",
                  "bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent"
                )}>
                  📋 Historial de Citas
                </h3>

                {historyQuery.isLoading && (
                  <div className="text-center py-8">
                    <Loader size={32} className="mx-auto mb-2 animate-spin text-cyan" />
                    <p className="text-text-secondary">Cargando historial...</p>
                  </div>
                )}

                {historyQuery.isError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "p-4 rounded-lg",
                      "bg-danger/10 border border-danger/30 text-danger text-sm"
                    )}
                  >
                    No se pudo cargar el historial
                  </motion.div>
                )}

                {historyQuery.isSuccess && historyQuery.data.length === 0 && (
                  <p className="text-center text-text-secondary py-8">
                    Aún no hay citas registradas para esta mascota
                  </p>
                )}

                {historyQuery.isSuccess && historyQuery.data.length > 0 && (
                  <motion.div
                    className="grid gap-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {historyQuery.data.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        variants={itemVariants}
                        className={cn(
                          "p-4 rounded-lg border",
                          "bg-surface border-border/30",
                          "hover:border-cyan/50 transition-all"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-text-primary text-sm">
                              {new Date(
                                appointment.startsAt
                              ).toLocaleDateString("es-CO", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-text-tertiary mt-1">
                              {new Date(appointment.startsAt).toLocaleTimeString(
                                "es-CO"
                              )}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs",
                              appointment.status === "COMPLETED"
                                ? "bg-success/20 border-success/50 text-success"
                                : appointment.status === "CANCELLED"
                                  ? "bg-danger/20 border-danger/50 text-danger"
                                  : "bg-cyan/20 border-cyan/50 text-cyan"
                            )}
                          >
                            {appointment.status ?? "PENDING"}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}
