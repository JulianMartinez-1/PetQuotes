"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
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
    <Modal
      open={isOpen}
      title="Agregar nueva mascota"
      onClose={handleClose}
      maxWidth="max-w-2xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <p className="text-sm text-text-secondary -mt-3 mb-5">
        Registra los datos de tu compañero
      </p>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">
                {/* Foto de perfil */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Foto de perfil</label>
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
                    <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-1">
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
                    <label htmlFor="species" className="block text-sm font-semibold text-text-primary mb-1">
                      Especie *
                    </label>
                    <select
                      id="species"
                      value={formData.species}
                      onChange={(e) => handleSelectChange(e.target.value)}
                      className={cn(
                        "w-full h-11 px-4 rounded-lg border transition-all outline-none mt-1",
                        "bg-surface border-border text-text-primary",
                        "focus:border-secondary-500 focus:ring-2 focus:ring-secondary-300",
                        "dark:bg-dark-surface dark:border-gray-600 dark:text-white"
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
                    <label htmlFor="breed" className="block text-sm font-semibold text-text-primary mb-1">Raza</label>
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
                    <label htmlFor="age" className="block text-sm font-semibold text-text-primary mb-1">Edad (años)</label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.age}
                      onChange={handleInputChange}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      placeholder="Ej. 3"
                      className="mt-1"
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label htmlFor="weight" className="block text-sm font-semibold text-text-primary mb-1">Peso (kg)</label>
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
                    <label htmlFor="color" className="block text-sm font-semibold text-text-primary mb-1">Color</label>
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
                  <label htmlFor="medicalNotes" className="block text-sm font-semibold text-text-primary mb-1">Notas médicas</label>
                  <textarea
                    id="medicalNotes"
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={handleInputChange}
                    placeholder="Alergias, condiciones especiales, etc."
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border transition-all outline-none resize-none mt-1",
                      "bg-surface border-border text-text-primary placeholder:text-text-muted",
                      "focus:border-secondary-500 focus:ring-2 focus:ring-secondary-300",
                      "dark:bg-dark-surface dark:border-gray-600 dark:text-white"
                    )}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">
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
    </Modal>
  );
}