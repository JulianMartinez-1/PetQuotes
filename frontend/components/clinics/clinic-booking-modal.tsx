"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  PawPrint,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { usePetsState } from "@/store/pets-state";
import { useAuthState } from "@/store/auth-state";
import { TimeSlotPicker } from "@/components/ui/time-slot-picker";

const BOOKING_DRAFT_KEY = "petquotes_booking_draft";

interface ClinicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: {
    id: string;
    name: string;
    city?: string;
    neighborhood?: string;
    phone?: string;
    services: string[];
  };
}

const WIZARD_STEPS = ["pet", "service", "date", "time", "confirm"] as const;
type WizardStep = (typeof WIZARD_STEPS)[number];
type BookingStep = WizardStep | "success";

const STEP_ANNOUNCEMENTS: Record<WizardStep, string> = {
  pet: "Paso 1 de 5: selecciona la mascota",
  service: "Paso 2 de 5: selecciona el servicio",
  date: "Paso 3 de 5: elige la fecha",
  time: "Paso 4 de 5: elige el horario",
  confirm: "Paso 5 de 5: confirma tu reserva",
};

export function ClinicBookingModal({
  isOpen,
  onClose,
  clinic,
}: ClinicBookingModalProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const { pets } = usePetsState();
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep] = useState<BookingStep>("pet");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [notificationChannel, setNotificationChannel] = useState<"EMAIL" | null | "loading">("loading");

  const stepContentRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      setStep("pet");
      setDirection(1);
      setSelectedPetId("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      setStepError(null);
      setBookingError(null);
    }
  }, [isOpen]);

  // Fetch notification channel when modal opens
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    setNotificationChannel("loading");
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setNotificationChannel(data?.notificationChannel === "EMAIL" ? "EMAIL" : null);
      })
      .catch(() => setNotificationChannel(null));
  }, [isOpen, isAuthenticated]);

  // Move focus to step heading on each transition
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const heading = stepContentRef.current?.querySelector<HTMLElement>(
        "[data-step-heading]"
      );
      heading?.focus();
    }, 140);
    return () => clearTimeout(timer);
  }, [step, isOpen]);

  const stepIndex = WIZARD_STEPS.indexOf(step as WizardStep);
  const isWizardStep = stepIndex >= 0;

  const goToStep = (target: WizardStep, dir: 1 | -1) => {
    setStepError(null);
    setDirection(dir);
    setStep(target);
  };

  // Pet selected → auto-advance to service after brief visual confirmation
  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
    setStepError(null);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      goToStep("service", 1);
    }, shouldReduceMotion ? 0 : 280);
  };

  // Service selected → auto-advance to date after brief visual confirmation
  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setStepError(null);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      goToStep("date", 1);
    }, shouldReduceMotion ? 0 : 280);
  };

  const validateCurrentStep = (): string | null => {
    switch (step) {
      case "pet":
        return selectedPetId ? null : "Selecciona una mascota para continuar";
      case "service":
        return selectedService ? null : "Selecciona un servicio para continuar";
      case "date":
        return selectedDate ? null : "Elige una fecha para continuar";
      case "time":
        return selectedTime ? null : "Elige un horario para continuar";
      default:
        return null;
    }
  };

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) { setStepError(error); return; }
    setStepError(null);
    setDirection(1);
    const next = WIZARD_STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const handleBack = () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setStepError(null);
    setDirection(-1);
    const prev = WIZARD_STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleSubmit = async () => {
    if (!selectedPetId || !selectedService || !selectedDate || !selectedTime)
      return;

    setIsSubmitting(true);
    setBookingError(null);
    try {
      // API proxy expects date (YYYY-MM-DD) and time (HH:mm) as separate fields
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: clinic.id,
          clinicName: clinic.name,
          petId: selectedPetId,
          service: selectedService,
          date: selectedDate,
          time: selectedTime,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body?.message ||
            `Error ${response.status}: no se pudo crear la reserva`
        );
      }

      setStep("success");
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear la reserva"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (image?: string): string | undefined => {
    if (!image) return undefined;
    if (image.startsWith("data:")) return image;
    if (image.match(/^[A-Za-z0-9+/=]+$/)) return `data:image/jpeg;base64,${image}`;
    return image;
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const formatDate = (date: string) =>
    new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (time: string): string => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const stepVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : dir * 24,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : dir * -24,
      transition: { duration: shouldReduceMotion ? 0 : 0.18, ease: "easeIn" },
    }),
  };

  if (!isAuthenticated) {
    return (
      <Modal open={isOpen} title="Inicia Sesión" onClose={onClose}>
        <p className="text-sm text-text-secondary mb-6">
          Debes iniciar sesión para reservar una cita
        </p>
        <Button
          className="w-full"
          onClick={() => { onClose(); router.push("/login"); }}
        >
          Ir a Iniciar Sesión
        </Button>
      </Modal>
    );
  }

  return (
    <Modal
      open={isOpen}
      title="Reservar Cita"
      subtitle={step !== "success" ? clinic.name : undefined}
      onClose={onClose}
      maxWidth="max-w-lg"
      className="max-h-[90vh] overflow-y-auto"
      stepIndicator={
        isWizardStep
          ? { current: stepIndex + 1, total: WIZARD_STEPS.length }
          : undefined
      }
      stepAnnouncement={
        isWizardStep ? STEP_ANNOUNCEMENTS[step as WizardStep] : undefined
      }
    >
      <div ref={stepContentRef}>
        <AnimatePresence mode="wait" custom={direction}>

          {/* ── Paso 1: Mascota ── */}
          {step === "pet" && (
            <motion.div
              key="pet"
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h3
                data-step-heading
                tabIndex={-1}
                className="text-base font-semibold text-text-primary mb-4 outline-none"
              >
                ¿Con cuál mascota es la cita?
              </h3>

              {pets.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                    <PawPrint size={26} className="text-text-muted" />
                  </div>
                  <p className="text-text-primary font-semibold mb-1">Sin mascotas registradas</p>
                  <p className="text-text-secondary text-sm mb-5">
                    Agrega tu primera mascota para reservar una cita
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { onClose(); router.push("/profile"); }}
                  >
                    Agregar Mascota
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pets.map((pet) => {
                    const isSelected = selectedPetId === pet.id;
                    return (
                      <motion.button
                        key={pet.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handlePetSelect(pet.id)}
                        className={cn(
                          "relative rounded-xl border-2 transition-all duration-200 overflow-hidden text-left",
                          isSelected
                            ? "border-secondary-500 ring-2 ring-secondary-500/30 shadow-md"
                            : "border-border/40 hover:border-secondary-400 hover:shadow-sm"
                        )}
                        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                      >
                        {/* Checkmark badge */}
                        {isSelected && (
                          <motion.div
                            initial={shouldReduceMotion ? {} : { scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center shadow-lg"
                          >
                            <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}

                        {/* Pet image */}
                        {pet.profileImage && getImageUrl(pet.profileImage) ? (
                          <div className={cn(
                            "w-full h-28 overflow-hidden transition-all",
                            isSelected && "opacity-90"
                          )}>
                            <img
                              src={getImageUrl(pet.profileImage)}
                              alt={pet.name || "Mascota"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={cn(
                            "w-full h-28 bg-gradient-to-br from-surface-2 to-border/20 flex items-center justify-center transition-all",
                            isSelected && "from-secondary-50 to-secondary-100"
                          )}>
                            <span className="text-4xl">🐾</span>
                          </div>
                        )}

                        {/* Pet info */}
                        <div className={cn(
                          "p-3 transition-colors",
                          isSelected ? "bg-secondary-500/10" : "bg-transparent"
                        )}>
                          <div className={cn(
                            "font-semibold text-sm",
                            isSelected ? "text-secondary-700" : "text-text-primary"
                          )}>
                            {pet.name || "Sin nombre"}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            {pet.species}{pet.breed && ` • ${pet.breed}`}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Show hint that selection auto-advances */}
              {pets.length > 0 && !selectedPetId && (
                <p className="text-xs text-text-muted text-center mt-4">
                  Toca una mascota para continuar
                </p>
              )}
            </motion.div>
          )}

          {/* ── Paso 2: Servicio ── */}
          {step === "service" && (
            <motion.div
              key="service"
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h3
                data-step-heading
                tabIndex={-1}
                className="text-base font-semibold text-text-primary mb-4 outline-none"
              >
                ¿Qué servicio necesitas?
              </h3>
              <div className="space-y-2.5">
                {clinic.services.map((service) => {
                  const isSelected = selectedService === service;
                  return (
                    <motion.button
                      key={service}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleServiceSelect(service)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between",
                        isSelected
                          ? "border-secondary-500 bg-secondary-500 shadow-md shadow-secondary-500/20"
                          : "border-border/40 bg-surface hover:border-secondary-400 hover:bg-secondary-50/50"
                      )}
                      whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    >
                      <span className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-white" : "text-text-primary"
                      )}>
                        {service}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={shouldReduceMotion ? {} : { scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 size={18} className="text-white shrink-0" strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {!selectedService && (
                <p className="text-xs text-text-muted text-center mt-4">
                  Toca un servicio para continuar
                </p>
              )}
            </motion.div>
          )}

          {/* ── Paso 3: Fecha ── */}
          {step === "date" && (
            <motion.div
              key="date"
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h3
                data-step-heading
                tabIndex={-1}
                className="text-base font-semibold text-text-primary mb-5 outline-none"
              >
                ¿Qué día prefieres?
              </h3>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <CalendarDays size={15} className="text-secondary-500" />
                Fecha de la cita
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400 size-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setStepError(null);
                  }}
                  min={getTomorrowDate()}
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all font-medium outline-none",
                    "bg-surface text-text-primary",
                    "focus:ring-2 focus:ring-secondary-500/20",
                    selectedDate
                      ? "border-secondary-500 bg-secondary-50/50"
                      : "border-border focus:border-secondary-500"
                  )}
                />
              </div>
              {selectedDate && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary-500/10 border border-secondary-500/20"
                >
                  <CheckCircle2 size={14} className="text-secondary-600 shrink-0" />
                  <p className="text-sm font-semibold text-secondary-700 capitalize">
                    {formatDate(selectedDate)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Paso 4: Hora ── */}
          {step === "time" && (
            <motion.div
              key="time"
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h3
                data-step-heading
                tabIndex={-1}
                className="text-base font-semibold text-text-primary mb-5 outline-none"
              >
                ¿A qué hora?
              </h3>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-4">
                <Clock size={15} className="text-secondary-500" />
                Horario disponible
              </label>
              <TimeSlotPicker
                value={selectedTime}
                onChange={(t) => {
                  setSelectedTime(t);
                  setStepError(null);
                }}
              />

              <div className="mt-6">
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Notas adicionales{" "}
                  <span className="font-normal text-text-muted">(opcional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: consulta por dolor de oído, lleva 3 días con el síntoma..."
                  rows={3}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border-2 transition-all resize-none outline-none",
                    "bg-surface text-text-primary placeholder:text-text-muted",
                    "border-border/40 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
                  )}
                />
              </div>
            </motion.div>
          )}

          {/* ── Paso 5: Confirmar ── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h3
                data-step-heading
                tabIndex={-1}
                className="text-base font-semibold text-text-primary mb-5 outline-none"
              >
                Revisa los detalles antes de confirmar
              </h3>
              <div className="bg-surface rounded-xl border border-border/30 overflow-hidden">
                <SummaryRow label="Clínica" value={clinic.name} />
                <SummaryRow
                  label="Mascota"
                  value={`${selectedPet?.name || "Sin nombre"}${selectedPet?.species ? ` (${selectedPet.species})` : ""}`}
                />
                <SummaryRow label="Servicio" value={selectedService} />
                <SummaryRow
                  label="Fecha"
                  value={formatDate(selectedDate)}
                  className="capitalize"
                />
                <SummaryRow
                  label="Hora"
                  value={`${formatTime(selectedTime)} (hora Colombia)`}
                  last={!notes}
                />
                {notes && <SummaryRow label="Notas" value={notes} last />}
              </div>

              {/* Notification channel warning */}
              <AnimatePresence>
                {notificationChannel !== "loading" && notificationChannel === null && (
                  <motion.div
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-warning/10 border border-warning/30"
                    role="alert"
                  >
                    <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 mb-0.5">
                        Falta configurar cómo avisarte
                      </p>
                      <p className="text-xs text-slate-600 mb-3">
                        Para recibir la confirmación de tu cita, primero elige tu canal de notificación en tu perfil.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          try {
                            localStorage.setItem(
                              BOOKING_DRAFT_KEY,
                              JSON.stringify({
                                clinicId: clinic.id,
                                clinicName: clinic.name,
                                selectedPetId,
                                selectedService,
                                selectedDate,
                                selectedTime,
                                notes,
                              })
                            );
                          } catch {
                            // ignore storage errors
                          }
                          onClose();
                          router.push("/profile?notify=1#notificaciones");
                        }}
                      >
                        Configurar canal de notificación →
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* API error */}
              <AnimatePresence>
                {bookingError && (
                  <motion.div
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm"
                    role="alert"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-0.5">No se pudo crear la reserva</p>
                      <p>{bookingError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Éxito ── */}
          {step === "success" && (
            <motion.div
              key="success"
              custom={1}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center py-4"
            >
              <motion.div
                initial={shouldReduceMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: shouldReduceMotion ? 0 : 0.1, stiffness: 400, damping: 22 }}
                className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle2 size={44} className="text-success" />
              </motion.div>

              <h3
                data-step-heading
                tabIndex={-1}
                className="text-2xl font-bold text-text-primary mb-2 outline-none"
              >
                ¡Reserva recibida!
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Tu reserva está pendiente de aprobación. Cuando el admin la confirme, recibirás un correo de confirmación.
              </p>

              <div className="bg-surface rounded-xl border border-border/30 overflow-hidden mb-6 text-left">
                <SummaryRow label="Servicio" value={selectedService} />
                <SummaryRow label="Fecha" value={formatDate(selectedDate)} className="capitalize" />
                <SummaryRow label="Hora" value={formatTime(selectedTime)} />
                <SummaryRow label="Clínica" value={clinic.name} last />
              </div>

              <Button className="w-full" onClick={() => { onClose(); router.push("/bookings"); }}>
                Ver mis reservas
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Per-step validation message */}
        <AnimatePresence>
          {stepError && (
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-sm text-danger flex items-center gap-1.5"
              role="alert"
            >
              <AlertCircle size={14} className="shrink-0" />
              {stepError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Navigation buttons — not shown on auto-advance steps or success */}
        {step !== "success" && step !== "pet" && step !== "service" && (
          <div className="flex gap-3 mt-6">
            {stepIndex > 0 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft size={16} />
                Atrás
              </Button>
            )}

            {step !== "confirm" ? (
              <Button onClick={handleNext} className="flex-1">
                Continuar
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || notificationChannel !== "EMAIL"}
                className="flex-1"
                title={notificationChannel !== "EMAIL" ? "Configura tu canal de notificación primero" : undefined}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Creando reserva...
                  </>
                ) : (
                  "Confirmar reserva"
                )}
              </Button>
            )}
          </div>
        )}

        {/* Back button for auto-advance steps (pet / service) */}
        {(step === "pet" || step === "service") && stepIndex > 0 && (
          <div className="mt-6">
            <Button variant="outline" onClick={handleBack} className="w-full">
              <ChevronLeft size={16} />
              Atrás
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function SummaryRow({
  label,
  value,
  className,
  last = false,
}: {
  label: string;
  value: string;
  className?: string;
  last?: boolean;
}) {
  return (
    <div className={cn("px-5 py-3.5", !last && "border-b border-border/20")}>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className={cn("text-sm font-semibold text-text-primary", className)}>
        {value}
      </p>
    </div>
  );
}
