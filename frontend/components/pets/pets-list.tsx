"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Pet {
  id: string;
  name?: string;
  species: string;
  breed?: string;
  age?: string;
  weight?: string;
  profileImage?: string;
  notes?: string;
  createdAt?: string;
}

interface PetsListProps {
  pets: Pet[];
  onDelete?: (petId: string) => Promise<void>;
  onEdit?: (pet: Pet) => void;
  isLoading?: boolean;
}

const speciesEmojis: Record<string, string> = {
  dog: "🐕",
  cat: "🐱",
  rabbit: "🐰",
  bird: "🐦",
  hamster: "🐹",
  other: "🐾",
};

const speciesLabels: Record<string, string> = {
  dog: "Perro",
  cat: "Gato",
  rabbit: "Conejo",
  bird: "Pájaro",
  hamster: "Hámster",
  other: "Otro",
};

export function PetsList({ pets, onDelete, onEdit, isLoading = false }: PetsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (petId: string) => {
    if (!onDelete) return;
    setDeletingId(petId);
    try {
      await onDelete(petId);
    } finally {
      setDeletingId(null);
    }
  };

  if (pets.length === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-gray-50 dark:bg-dark-bg rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-5xl mb-4">🐾</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No tienes mascotas registradas
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Agrega tu primera mascota para comenzar
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pets.map((pet, index) => (
        <motion.div
          key={pet.id}
          className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          {/* Pet Image */}
          {pet.profileImage ? (
            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img
                src={pet.profileImage}
                alt={pet.name || "Pet"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-dark-bg/90 rounded-full p-2">
                <Heart
                  size={20}
                  className="text-primary fill-primary"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <span className="text-6xl">
                {speciesEmojis[pet.species] || "🐾"}
              </span>
            </div>
          )}

          {/* Pet Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {pet.name || "Sin nombre"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {speciesEmojis[pet.species]} {speciesLabels[pet.species]}
                </p>
              </div>
            </div>

            {/* Pet Details */}
            <div className="space-y-1 mb-4 text-sm">
              {pet.breed && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Raza:</span> {pet.breed}
                </p>
              )}
              {pet.age && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Edad:</span> {pet.age} años
                </p>
              )}
              {pet.weight && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Peso:</span> {pet.weight} kg
                </p>
              )}
              {pet.notes && (
                <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  <span className="font-semibold">Notas:</span> {pet.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  onClick={() => onEdit(pet)}
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  <Edit2 size={16} />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={() => handleDelete(pet.id)}
                  disabled={deletingId === pet.id || isLoading}
                  variant="danger"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} />
                  {deletingId === pet.id ? "Eliminando..." : "Eliminar"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
