"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, PawPrint, AlertCircle } from "lucide-react";
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
  photo?: string;
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
  const [formData, setFormData] = useState<Pet>({
    name: "",
    species: "Perro",
  });

  useEffect(() => {
    loadPets();
  }, [userId]);

  useEffect(() => {
    onPetsChange?.(pets);
  }, [pets]);

  const loadPets = () => {
    // Cargar mascotas del localStorage
    const saved = localStorage.getItem(`pets_${userId}`);
    if (saved) {
      try {
        setPets(JSON.parse(saved));
      } catch {
        setPets([]);
      }
    }
  };

  const savePets = (updatedPets: Pet[]) => {
    setPets(updatedPets);
    localStorage.setItem(`pets_${userId}`, JSON.stringify(updatedPets));
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

      setFormData({ name: "", species: "Perro" });
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
    setFormData({ name: "", species: "Perro" });
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
            "bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
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
              <div className="flex items-start justify-between">
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
