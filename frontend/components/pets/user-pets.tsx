"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import Link from "next/link";
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

interface UserPetsProps {
  userId: string;
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

export function UserPets({ userId }: UserPetsProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPets();
  }, [userId]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/session/pets");
      if (!response.ok) {
        throw new Error("Failed to fetch pets");
      }
      const data = await response.json();
      setPets(data.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching pets");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Cargando mascotas...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Mis Mascotas
        </h3>
        <Link href="/pets?tab=add">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors">
            <Plus size={16} />
            Agregar
          </button>
        </Link>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <motion.div
          className="text-center py-8 bg-gray-50 dark:bg-dark-bg rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-3xl mb-2">🐾</div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No tienes mascotas registradas aún
          </p>
          <Link href="/pets">
            <button className="mt-3 text-sm text-primary hover:text-primary/80 font-semibold">
              Agregar mascota →
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              {/* Pet Image */}
              {pet.profileImage ? (
                <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={
                      pet.profileImage.startsWith("data:")
                        ? pet.profileImage
                        : `data:image/jpeg;base64,${pet.profileImage}`
                    }
                    alt={pet.name || "Pet"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 right-1 bg-white/90 dark:bg-dark-bg/90 rounded-full p-1">
                    <Heart
                      size={14}
                      className="text-primary fill-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <span className="text-4xl">
                    {speciesEmojis[pet.species] || "🐾"}
                  </span>
                </div>
              )}

              {/* Pet Info */}
              <div className="p-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                  {pet.name || "Sin nombre"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {speciesEmojis[pet.species]} {speciesLabels[pet.species]}
                </p>

                {/* Pet Details */}
                <div className="mt-2 space-y-0.5 text-xs">
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
                </div>

                {/* View Link */}
                <Link href={`/pets/${pet.id}`}>
                  <button className="mt-2 w-full py-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    Ver más →
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
