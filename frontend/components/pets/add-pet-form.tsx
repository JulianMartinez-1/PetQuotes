"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PetFormData {
  name: string;
  age: string;
  species: string;
  breed: string;
  weight: string;
  notes: string;
  profileImage: File | null;
}

interface AddPetFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export function AddPetForm({ onSubmit, isLoading = false }: AddPetFormProps) {
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    age: "",
    species: "dog",
    breed: "",
    weight: "",
    notes: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede ser mayor a 5MB");
      return;
    }
    setFormData((prev) => ({ ...prev, profileImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: null }));
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.profileImage) {
      setError("La foto de la mascota es obligatoria");
      return;
    }

    if (!formData.age) {
      setError("La edad de la mascota es obligatoria");
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("age", formData.age);
      formDataToSubmit.append("species", formData.species);
      formDataToSubmit.append("breed", formData.breed);
      formDataToSubmit.append("weight", formData.weight);
      formDataToSubmit.append("notes", formData.notes);
      if (formData.profileImage) {
        formDataToSubmit.append("profileImage", formData.profileImage);
      }

      await onSubmit(formDataToSubmit);

      setSuccess(true);
      setFormData({
        name: "",
        age: "",
        species: "dog",
        breed: "",
        weight: "",
        notes: "",
        profileImage: null,
      });
      setPreview(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la mascota");
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Plus size={24} className="text-primary" />
        Agregar Nueva Mascota
      </h2>

      {error && (
        <motion.div
          className="mb-4 p-4 bg-danger/10 border border-danger/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-danger text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          className="mb-4 p-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <Plus size={18} className="text-success flex-shrink-0" />
          <p className="text-success text-sm font-semibold">¡Mascota agregada exitosamente!</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !preview && fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border dark:border-gray-600 bg-surface-light dark:bg-dark-bg hover:border-primary-400 hover:bg-primary/5",
            !preview && "cursor-pointer"
          )}
        >
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <Upload
                size={32}
                className={cn("mx-auto mb-3 transition-colors", isDragging ? "text-primary" : "text-text-muted")}
              />
              <p className="text-text-primary font-semibold mb-1">
                {isDragging ? "¡Suelta la imagen aquí!" : "Arrastra la foto aquí"}
              </p>
              <p className="text-sm text-text-secondary mb-4">
                o haz clic para seleccionarla — PNG, JPG, máx 5 MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {preview && (
            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              variant="outline"
              size="sm"
            >
              Cambiar foto
            </Button>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Nombre (Opcional)
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Max"
              className="w-full"
            />
          </div>

          {/* Age - Required */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Edad (Años) <span className="text-danger">*</span>
            </label>
            <Input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              placeholder="Ej: 3"
              min="0"
              max="100"
              step="1"
              className="w-full"
              required
            />
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Tipo de Mascota
            </label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              className={cn(
                "w-full h-11 px-4 rounded-lg border transition-all outline-none",
                "bg-surface border-border text-text-primary",
                "focus:border-secondary-500 focus:ring-2 focus:ring-secondary-300",
                "dark:bg-dark-surface dark:border-gray-600 dark:text-white"
              )}
            >
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
              <option value="rabbit">Conejo</option>
              <option value="bird">Pájaro</option>
              <option value="hamster">Hámster</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Breed - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Raza (Opcional)
            </label>
            <Input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Ej: Labrador"
              className="w-full"
            />
          </div>

          {/* Weight - Optional */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Peso (kg) (Opcional)
            </label>
            <Input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Ej: 25"
              min="0"
              max="150"
              step="0.1"
              className="w-full"
            />
          </div>
        </div>

        {/* Notes - Optional */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Notas Adicionales (Opcional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Ej: Tiene alergia a ciertos alimentos, le encanta jugar, etc."
            rows={3}
            className={cn(
              "w-full px-4 py-3 rounded-lg border transition-all outline-none resize-none",
              "bg-surface border-border text-text-primary placeholder:text-text-muted",
              "focus:border-secondary-500 focus:ring-2 focus:ring-secondary-300",
              "dark:bg-dark-surface dark:border-gray-600 dark:text-white"
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Guardando..." : "Guardar Mascota"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
