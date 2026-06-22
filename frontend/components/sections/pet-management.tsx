"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, PawPrint, AlertCircle, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Pet {
  id?: string;
  name: string;
  species: "Perro" | "Gato" | "Otro";
  breed?: string;
  dateOfBirth?: string;
  profileImage?: string;
}

interface PetManagementProps {
  userId: string;
  onPetsChange?: (pets: Pet[]) => void;
}

export const PetManagement: React.FC<PetManagementProps> = ({
  userId,
  onPetsChange,
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<Pet>({
    name: "",
    species: "Perro",
  });

  // Obtener el ID real del usuario autenticado
  const getAuthUserId = () => {
    try {
      const authUser = localStorage.getItem("auth_user");
      if (authUser) {
        const user = JSON.parse(authUser);
        return user.id;
      }
    } catch (e) {
      console.error("Error parsing auth_user:", e);
    }
    return userId || "default";
  };

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    onPetsChange?.(pets);
  }, [pets, onPetsChange]);

  const loadPets = () => {
    // Cargar mascotas del localStorage usando el ID del usuario autenticado
    const authUserId = getAuthUserId();
    const saved = localStorage.getItem(`pets_${authUserId}`);
    if (saved) {
      try {
        setPets(JSON.parse(saved));
      } catch {
        setPets([]);
      }
    }
  };

  const savePets = (updatedPets: Pet[]) => {
    const authUserId = getAuthUserId();
    setPets(updatedPets);
    localStorage.setItem(`pets_${authUserId}`, JSON.stringify(updatedPets));
  };

  const handleAddPet = () => {
    if (!formData.name.trim()) {
      alert("El nombre de la mascota es requerido");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (editingId) {
        // Actualizar mascota existente
        const updated = pets.map((pet) =>
          pet.id === editingId ? { ...formData, id: pet.id } : pet
        );
        savePets(updated);
        setEditingId(null);
      } else {
        // Agregar nueva mascota
        const newPet: Pet = {
          ...formData,
          id: Date.now().toString(),
        };
        savePets([...pets, newPet]);
      }

      setFormData({ name: "", species: "Perro", profileImage: undefined });
      setShowForm(false);
      setLoading(false);
    }, 500);
  };

  const handleEditPet = (pet: Pet) => {
    setFormData(pet);
    setEditingId(pet.id || null);
    setShowForm(true);
  };

  const handleDeletePet = (id: string | undefined) => {
    if (!id) return;
    if (confirm("¿Estás seguro de que deseas eliminar esta mascota?")) {
      savePets(pets.filter((pet) => pet.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", species: "Perro", profileImage: undefined });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items) {
      e.dataTransfer.dropEffect = "copy";
    }
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo cambiar a false si salimos completamente del elemento
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validar que sea imagen
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setFormData({ ...formData, profileImage: result });
        };
        reader.onerror = () => {
          alert("Error al leer el archivo");
        };
        reader.readAsDataURL(file);
      } else {
        alert("Por favor arrastra un archivo de imagen válido (PNG, JPG, GIF, WebP)");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData({ ...formData, profileImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <Card className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2
          className={cn(
            "text-2xl font-bold",
            "bg-gradient-to-r from-secondary-500 to-accent-500 bg-clip-text text-transparent"
          )}
        >
          🐾 Mis Mascotas
        </h2>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            size="sm"
            className="gap-2"
          >
            <Plus size={16} />
            Agregar Mascota
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-secondary/5 rounded-lg border border-secondary/20"
        >
          <h3 className="font-semibold text-text-primary mb-4">
            {editingId ? "Editar Mascota" : "Agregar Nueva Mascota"}
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Nombre *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Max, Luna, Misi"
                variant="default"
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Especie
              </label>
              <select
                value={formData.species}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    species: e.target.value as "Perro" | "Gato" | "Otro",
                  })
                }
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-all",
                  "bg-surface border-border/30 text-text-primary",
                  "hover:border-secondary/50 focus:border-secondary focus:ring-secondary/20"
                )}
              >
                <option value="Perro">🐕 Perro</option>
                <option value="Gato">🐈 Gato</option>
                <option value="Otro">🐾 Otro</option>
              </select>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Raza (Opcional)
              </label>
              <Input
                value={formData.breed || ""}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                placeholder="Ej: Labrador, Siamés"
                variant="default"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Fecha de Nacimiento (Opcional)
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                variant="default"
              />
            </div>

            {/* Photo Upload with Drag and Drop */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Foto (Opcional)
              </label>
              
              {formData.profileImage ? (
                <div className="relative w-full">
                  <img
                    src={formData.profileImage}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profileImage: undefined })}
                    className={cn(
                      "absolute -top-2 -right-2 p-1 rounded-full transition-all",
                      "bg-danger text-white hover:bg-danger/80"
                    )}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "w-full p-8 rounded-lg border-2 border-dashed transition-all",
                    "flex flex-col items-center justify-center gap-4",
                    isDragging
                      ? "border-secondary bg-secondary/10 scale-105"
                      : "border-border/30 bg-surface hover:border-secondary/50 hover:bg-secondary/5"
                  )}
                >
                  <Upload size={32} className="text-secondary" />
                  <div className="text-center">
                    <p className="font-semibold text-text-primary">
                      Arrastra tu foto aquí
                    </p>
                    <p className="text-sm text-text-tertiary mt-2">
                      PNG, JPG, GIF o WebP
                    </p>
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">o</p>
                  <label className="px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer hover:bg-secondary/90 transition-all text-sm font-semibold">
                    Selecciona un archivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddPet}
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Guardando..." : editingId ? "Actualizar" : "Agregar"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pets List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {pets.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-8 px-4 bg-secondary/5 rounded-lg border border-dashed border-secondary/30"
          >
            <PawPrint size={32} className="mx-auto text-text-tertiary mb-2" />
            <p className="text-text-secondary">
              Aún no tienes mascotas registradas
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Comienza agregando tu primera mascota
            </p>
          </motion.div>
        ) : (
          pets.map((pet) => (
            <motion.div
              key={pet.id}
              variants={itemVariants}
              className={cn(
                "p-4 rounded-lg border transition-all",
                "bg-surface border-border/30 hover:border-secondary/50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Pet Photo */}
                {pet.profileImage && (
                  <img
                    src={pet.profileImage}
                    alt={pet.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary flex items-center gap-2">
                    {pet.species === "Perro" && "🐕"}
                    {pet.species === "Gato" && "🐈"}
                    {pet.species === "Otro" && "🐾"}
                    {pet.name}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-text-secondary">
                    {pet.breed && <p>Raza: {pet.breed}</p>}
                    {pet.dateOfBirth && (
                      <p>
                        Edad:{" "}
                        {Math.floor(
                          (Date.now() - new Date(pet.dateOfBirth).getTime()) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        )}{" "}
                        años
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditPet(pet)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      "bg-secondary/10 text-secondary hover:bg-secondary/20"
                    )}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      "bg-danger/10 text-danger hover:bg-danger/20"
                    )}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </Card>
  );
};
