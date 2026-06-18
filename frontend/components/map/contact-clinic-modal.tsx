"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/store/auth-state";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  profileImage?: string;
}

interface ContactClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: {
    id: string;
    name: string;
    phone?: string;
  };
}

export function ContactClinicModal({
  isOpen,
  onClose,
  clinic,
}: ContactClinicModalProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPets, setFetchingPets] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar mascotas del usuario
  if (!isAuthenticated) {
  return (
    <div className="p-6 text-center">
      <p className="text-text-secondary">
        Debes iniciar sesión para contactar a la veterinaria.
      </p>
      <Button className="mt-4" onClick={() => router.push("/login")}>
        Iniciar sesión
      </Button>
    </div>
  );
}
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const fetchPets = async () => {
      try {
        setFetchingPets(true);
        const response = await fetch("/api/session/pets");
        if (!response.ok) throw new Error("Error al cargar mascotas");
        const data = await response.json();
        setPets(data.items || []);
        if (data.items && data.items.length > 0) {
          setSelectedPetId(data.items[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar mascotas");
      } finally {
        setFetchingPets(false);
      }
    };

    fetchPets();
  }, [isOpen, isAuthenticated]);

  const handleSubmit = async () => {
    if (!selectedPetId) {
      setError("Por favor selecciona una mascota");
      return;
    }
    if (!message.trim()) {
      setError("Por favor escribe un mensaje");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: clinic.id,
          petId: selectedPetId,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al enviar mensaje");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage("");
        setSelectedPetId("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar mensaje");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = () => {
    onClose();
    router.push("/pets");
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "w-full max-w-lg rounded-2xl border border-border/30",
                "bg-surface shadow-2xl overflow-hidden"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/20 px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    Contactar a {clinic.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Cuéntanos qué necesitas para tu mascota
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-surface-hover transition-colors"
                >
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 p-6">
                {/* Selección de mascota */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Mascota
                  </label>
                  {fetchingPets ? (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                      Cargando tus mascotas...
                    </div>
                  ) : pets.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/40 p-4 text-center">
                      <p className="text-sm text-text-secondary">
                        No tienes mascotas registradas.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 gap-2"
                        onClick={handleAddPet}
                      >
                        <Plus className="h-4 w-4" />
                        Agregar mascota
                      </Button>
                    </div>
                  ) : (
                  <select
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Selecciona una mascota</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species}{pet.breed ? ` - ${pet.breed}` : ""})
                      </option>
                    ))}
                  </select>
                  )}
                </div>

                {/* Mensaje */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Mensaje
                  </label>
                  <textarea
                    placeholder="Describe lo que necesitas para tu mascota (ej. consulta, vacunación, urgencia, etc.)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    disabled={pets.length === 0}
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    {message.length} caracteres
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
                    <Send className="h-4 w-4" />
                    Mensaje enviado correctamente
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-border/20 px-6 py-4">
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading || pets.length === 0 || !message.trim()}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}