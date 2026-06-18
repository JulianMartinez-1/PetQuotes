"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePetsState } from "@/store/pets-state";
import { useAuthState } from "@/store/auth-state";

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

const TIME_SLOTS = ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"];

export function ClinicBookingModal({
  isOpen,
  onClose,
  clinic,
}: ClinicBookingModalProps) {
  const { isAuthenticated } = useAuthState();
  const { pets } = usePetsState();
  const [step, setStep] = useState<"pet" | "service" | "date" | "confirm">("pet");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const getImageUrl = (image?: string): string | undefined => {
    if (!image) return undefined;
    if (image.startsWith("data:")) return image;
    if (image.match(/^[A-Za-z0-9+/=]+$/)) return `data:image/jpeg;base64,${image}`;
    return image;
  };

  useEffect(() => {
    if (!isOpen) {
      setStep("pet");
      setSelectedPetId("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      setBookingSuccess(false);
    }
  }, [isOpen]);

  const getTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const handleNext = () => {
    if (step === "pet" && selectedPetId) {
      setStep("service");
    } else if (step === "service" && selectedService) {
      setStep("date");
    } else if (step === "date" && selectedDate && selectedTime) {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "service") setStep("pet");
    else if (step === "date") setStep("service");
    else if (step === "confirm") setStep("date");
  };

  const handleSubmit = async () => {
    if (!selectedPetId || !selectedService || !selectedDate || !selectedTime) {
      alert("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: clinic.id,
          petId: selectedPetId,
          service: selectedService,
          date: selectedDate,
          time: selectedTime,
          notes,
        }),
      });

      if (!response.ok) {
        console.error("Error creating booking:", response.statusText);
        alert("Error al crear la reserva");
        return;
      }

      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        setBookingSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white dark:bg-dark-surface rounded-2xl max-w-md w-full p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  Inicia Sesión
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  Debes iniciar sesión para reservar una cita
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    onClose();
                    window.location.href = "/login";
                  }}
                >
                  Ir a Iniciar Sesión
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white dark:bg-dark-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-dark-surface border-b border-border/30 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">Reservar Cita</h2>
                  <p className="text-sm text-text-secondary mt-1">{clinic.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <X size={24} className="text-text-secondary" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex gap-2 mb-8">
                  {(["pet", "service", "date", "confirm"] as const).map((s, idx) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                          step === s
                            ? "bg-secondary text-white"
                            : ["pet", "service", "date", "confirm"].indexOf(step) > idx
                            ? "bg-success text-white"
                            : "bg-surface text-text-tertiary"
                        )}
                      >
                        {["pet", "service", "date", "confirm"].indexOf(step) > idx ? "✓" : idx + 1}
                      </div>
                      {idx < 3 && (
                        <div
                          className={cn(
                            "w-8 h-1 mx-2 transition-all",
                            ["pet", "service", "date", "confirm"].indexOf(step) > idx
                              ? "bg-success"
                              : "bg-surface"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {step === "pet" && (
                    <motion.div
                      key="pet"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Selecciona la mascota</h3>
                      {pets.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-text-secondary mb-4">No tienes mascotas registradas</p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              onClose();
                              window.location.href = "/pets";
                            }}
                          >
                            Agregar Mascota
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {pets.map((pet) => (
                            <motion.button
                              key={pet.id}
                              onClick={() => setSelectedPetId(pet.id)}
                              className={cn(
                                "rounded-xl border-2 transition-all overflow-hidden",
                                selectedPetId === pet.id
                                  ? "border-secondary bg-secondary/10"
                                  : "border-border/30 hover:border-secondary/50"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {pet.profileImage && getImageUrl(pet.profileImage) ? (
                                <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <img
                                    src={getImageUrl(pet.profileImage)}
                                    alt={pet.name || "Pet"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                  <span className="text-4xl">🐾</span>
                                </div>
                              )}
                              <div className="p-3">
                                <div className="font-semibold text-text-primary text-sm">
                                  {pet.name || "Sin nombre"}
                                </div>
                                <div className="text-xs text-text-secondary mt-1">
                                  {pet.species}
                                  {pet.breed && ` • ${pet.breed}`}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {step === "service" && (
                    <motion.div
                      key="service"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Selecciona el servicio</h3>
                      <div className="space-y-3">
                        {clinic.services.map((service) => (
                          <motion.button
                            key={service}
                            onClick={() => setSelectedService(service)}
                            className={cn(
                              "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between",
                              selectedService === service
                                ? "border-secondary bg-secondary/10"
                                : "border-border/30 hover:border-secondary/50"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="font-semibold text-text-primary">{service}</span>
                            {selectedService === service && (
                              <Badge className="bg-secondary text-white">Seleccionado</Badge>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === "date" && (
                    <motion.div
                      key="date"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Selecciona fecha y hora</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-text-primary mb-3">Fecha</label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={getTomorrowDate()}
                            className={cn(
                              "w-full px-4 py-3 rounded-lg border-2 transition-all",
                              "bg-surface text-text-primary",
                              "border-border/30 focus:border-secondary focus:outline-none"
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-primary mb-3">Hora</label>
                          <div className="grid grid-cols-3 gap-3">
                            {TIME_SLOTS.map((time) => (
                              <motion.button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "p-3 rounded-lg border-2 transition-all font-semibold flex items-center justify-center gap-2",
                                  selectedTime === time
                                    ? "border-secondary bg-secondary text-white"
                                    : "border-border/30 text-text-primary hover:border-secondary/50"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Clock size={16} />
                                {time}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-primary mb-3">Notas (opcional)</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Consulta por dolor de oído..."
                            rows={3}
                            className={cn(
                              "w-full px-4 py-3 rounded-lg border-2 transition-all resize-none",
                              "bg-surface text-text-primary placeholder-text-tertiary",
                              "border-border/30 focus:border-secondary focus:outline-none"
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === "confirm" && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-lg font-semibold text-text-primary mb-6">Confirma tu reserva</h3>

                      <div className="space-y-4 bg-surface p-6 rounded-xl border border-border/30">
                        <div className="pb-4 border-b border-border/30">
                          <p className="text-sm text-text-tertiary">Clínica</p>
                          <p className="font-semibold text-text-primary">{clinic.name}</p>
                        </div>

                        <div className="pb-4 border-b border-border/30">
                          <p className="text-sm text-text-tertiary">Mascota</p>
                          <p className="font-semibold text-text-primary">
                            {selectedPet?.name || "Sin nombre"} ({selectedPet?.species})
                          </p>
                        </div>

                        <div className="pb-4 border-b border-border/30">
                          <p className="text-sm text-text-tertiary">Servicio</p>
                          <p className="font-semibold text-text-primary">{selectedService}</p>
                        </div>

                        <div className="pb-4 border-b border-border/30">
                          <p className="text-sm text-text-tertiary">Fecha y Hora</p>
                          <p className="font-semibold text-text-primary">
                            {new Date(selectedDate).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            a las {selectedTime}
                          </p>
                        </div>

                        {notes && (
                          <div>
                            <p className="text-sm text-text-tertiary">Notas</p>
                            <p className="font-semibold text-text-primary">{notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === "pet"}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  {step !== "confirm" ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (step === "pet" && !selectedPetId) ||
                        (step === "service" && !selectedService) ||
                        (step === "date" && (!selectedDate || !selectedTime))
                      }
                      className="flex-1"
                    >
                      Siguiente
                      <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? "Creando..." : "Confirmar Reserva"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-dark-surface rounded-2xl max-w-md w-full p-8 text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="mb-4 text-5xl">✅</div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">¡Tu cita está registrada!</h3>
              <p className="text-text-secondary mb-4 leading-relaxed">
                Su cita está a la espera de ser confirmada, recibirás mensaje para confirmarlo.
              </p>
              <div className="mt-6 text-sm text-text-tertiary">
                {clinic.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
