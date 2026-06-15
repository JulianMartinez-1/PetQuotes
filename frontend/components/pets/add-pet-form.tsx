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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede ser mayor a 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, profileImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
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
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-green-700 dark:text-green-300 text-sm">
            ¡Mascota agregada exitosamente!
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-dark-bg hover:border-primary hover:bg-primary/5 transition-all duration-300">
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">
                Carga la foto de tu mascota
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                (Requerido - PNG, JPG, máx 5MB)
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
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
          >
            {preview ? "Cambiar foto" : "Seleccionar foto"}
          </Button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name - Optional */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Edad (Años) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Ej: 3"
              min="0"
              max="50"
              step="0.1"
              className="w-full"
              required
            />
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Mascota
            </label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600",
                "bg-white dark:bg-dark-bg text-gray-900 dark:text-white",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
              "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "resize-none"
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
