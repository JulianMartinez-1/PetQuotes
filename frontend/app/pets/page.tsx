"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AddPetForm, PetsList } from "@/components/pets";
import { useAuthState } from "@/store/auth-state";
import { usePetsState } from "@/store/pets-state";

export default function PetsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const { pets, isLoading, error: petsError, removePet, refreshPets } = usePetsState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(petsError);

  const handleAddPet = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch("/api/session/pets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add pet");
      }

      // Refrescar la lista de mascotas desde el servidor
      await refreshPets();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error adding pet";
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    try {
      const response = await fetch(`/api/session/pets/${petId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete pet");
      }

      removePet(petId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error deleting pet";
      setError(message);
      throw err;
    }
  };

  if (!isAuthenticated) {
    return <AuthGuard />;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-dark-bg dark:to-dark-surface py-8 pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            🐾 Mis Mascotas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra y registra la información de todas tus mascotas
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="list">
                Mis Mascotas ({pets.length})
              </TabsTrigger>
              <TabsTrigger value="add">Agregar Mascota</TabsTrigger>
            </TabsList>
          </motion.div>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-6">
            {isLoading ? (
              <motion.div
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Cargando mascotas...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PetsList
                  pets={pets}
                  onDelete={handleDeletePet}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </TabsContent>

          {/* Add Pet Tab */}
          <TabsContent value="add" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AddPetForm
                onSubmit={handleAddPet}
                isLoading={isSubmitting}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
