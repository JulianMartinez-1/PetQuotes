"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPetAdded?: () => void;
}

const speciesOptions = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "rabbit", label: "Conejo" },
  { value: "bird", label: "Pájaro" },
  { value: "hamster", label: "Hámster" },
  { value: "other", label: "Otro" },
];

export function AddPetModal({ isOpen, onClose, onPetAdded }: AddPetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    color: "",
    medicalNotes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, species: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      color: "",
      medicalNotes: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validaciones básicas
    if (!formData.name.trim()) {
      setError("El nombre de la mascota es obligatorio");
      setIsSubmitting(false);
      return;
    }
    if (!formData.species) {
      setError("Selecciona una especie");
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("species", formData.species);
      if (formData.breed) submitData.append("breed", formData.breed.trim());
      if (formData.age) submitData.append("age", formData.age.trim());
      if (formData.weight) submitData.append("weight", formData.weight.trim());
      if (formData.medicalNotes)
        submitData.append("notes", formData.medicalNotes.trim());
      if (selectedFile) {
        submitData.append("profileImage", selectedFile);
      }

      const response = await fetch("/api/session/pets", {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      if (!response.ok) {
        const rawText = await response.text();
        console.error("=== SAVE PET ERROR ===");
        console.error("Status:", response.status);
        console.error("StatusText:", response.statusText);
        console.error("Content-Type:", response.headers.get('content-type'));
        console.error("Response Length:", rawText.length);
        console.error("Response Text:", rawText.substring(0, 500));
        
        let errorData;
        try {
          errorData = JSON.parse(rawText);
        } catch {
          errorData = { raw: rawText || "(empty response)" };
        }
        console.error("Parsed Error:", errorData);
        throw new Error(errorData.message || errorData.error || errorData.raw || "Error al guardar la mascota");
      }

      // Éxito: cerrar modal y notificar
      resetForm();
      if (onPetAdded) onPetAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la mascota");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
            onClick={handleClose}
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
                "w-full max-w-2xl max-h-[90vh] overflow-y-auto",
                "rounded-2xl border border-border/30",
                "bg-white dark:bg-dark-surface shadow-2xl"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 sticky top-0 bg-white dark:bg-dark-surface z-10">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    Agregar nueva mascota
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Registra los datos de tu compañero
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 hover:bg-surface-hover transition-colors"
                >
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Foto de perfil */}
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Foto de perfil</label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🐾</span>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="pet-image"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-hover transition-colors text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        {selectedFile ? "Cambiar imagen" : "Subir imagen"}
                      </label>
                      <input
                        id="pet-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {selectedFile && (
                        <p className="text-xs text-text-secondary mt-1">
                          {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Nombre *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej. Firulais"
                      className="mt-1"
                    />
                  </div>

                  {/* Especie */}
                  <div>
                    <label htmlFor="species" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Especie *
                    </label>
                    <select
                      id="species"
                      value={formData.species}
                      onChange={(e) => handleSelectChange(e.target.value)}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1",
                        "dark:bg-dark-bg dark:border-gray-600"
                      )}
                    >
                      <option value="" disabled>Selecciona una especie</option>
                      {speciesOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Raza */}
                  <div>
                    <label htmlFor="breed" className="text-sm font-medium leading-none">Raza</label>
                    <Input
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      placeholder="Ej. Labrador"
                      className="mt-1"
                    />
                  </div>

                  {/* Edad */}
                  <div>
                    <label htmlFor="age" className="text-sm font-medium leading-none">Edad (años)</label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Ej. 2.5"
                      className="mt-1"
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label htmlFor="weight" className="text-sm font-medium leading-none">Peso (kg)</label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="Ej. 15.5"
                      className="mt-1"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label htmlFor="color" className="text-sm font-medium leading-none">Color</label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="Ej. Dorado"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Notas médicas */}
                <div>
                  <label htmlFor="medicalNotes" className="text-sm font-medium leading-none">Notas médicas</label>
                  <textarea
                    id="medicalNotes"
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={handleInputChange}
                    placeholder="Alergias, condiciones especiales, etc."
                    rows={3}
                    className={cn(
                      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 resize-none",
                      "dark:bg-dark-bg dark:border-gray-600"
                    )}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar mascota"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}