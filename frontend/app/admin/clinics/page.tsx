"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClinicForm } from "@/components/admin/clinic-form";
import { CSVImport } from "@/components/admin/csv-import";
import { useClinicStorage } from "@/hooks/useClinicStorage";
import { ClinicCatalogItem } from "@/lib/clinic-catalog";
import { cn } from "@/lib/utils";
import { DURATIONS } from "@/constants/animations";

export default function AdminClinicsPage() {
  const { clinics, loading, add, update, remove } = useClinicStorage();
  const [showForm, setShowForm] = useState(false);
  const [editingClinic, setEditingClinic] = useState<ClinicCatalogItem | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleAddClinic = (clinic: ClinicCatalogItem) => {
    add(clinic);
    setShowForm(false);
    setEditingClinic(null);
  };

  const handleEditClinic = (clinic: ClinicCatalogItem) => {
    update(clinic);
    setEditingClinic(null);
    setShowForm(false);
  };

  const handleDeleteClinic = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta veterinaria?")) {
      remove(id);
    }
  };

  const handleFormSubmit = (clinic: ClinicCatalogItem) => {
    if (editingClinic) {
      handleEditClinic(clinic);
    } else {
      handleAddClinic(clinic);
    }
  };

  const filteredClinics = filter === "all" ? clinics : clinics.filter((c) => c.city === filter);
  const cities = [...new Set(clinics.map((c) => c.city))];

  if (loading) {
    return (
      <main className="min-h-screen bg-dark p-6 flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Cargando veterinarias...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark p-6">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATIONS.base / 1000 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 px-4 py-2 bg-secondary/20 border-secondary/50 inline-block">
            <Building2 size={16} className="inline mr-2" />
            Panel de Administración
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-text-primary">
            Gestiona las Veterinarias
          </h1>

          <p className="text-text-secondary max-w-2xl mx-auto">
            Agrega, edita o elimina veterinarias. Importa datos en lote desde CSV.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: DURATIONS.base / 1000 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          <Button
            variant="primary"
            onClick={() => {
              setEditingClinic(null);
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus size={18} />
            Agregar Veterinaria
          </Button>

          <Button
            variant="secondary"
            onClick={() => setShowImport(!showImport)}
            className="gap-2"
          >
            Importar CSV
          </Button>
        </motion.div>

        {/* CSV Import Section */}
        <AnimatePresence>
          {showImport && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-12"
            >
              <CSVImport onImportComplete={() => setShowImport(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-12"
            >
              <ClinicForm
                clinic={editingClinic || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingClinic(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Clinics List Section */}
      <section className="max-w-7xl mx-auto">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: DURATIONS.base / 1000 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className={cn(
            "p-4 rounded-xl text-center",
            "bg-surface border border-border/30"
          )}>
            <div className="text-2xl font-bold text-text-primary">{clinics.length}</div>
            <div className="text-xs text-text-tertiary mt-1">Total de Veterinarias</div>
          </div>
          {cities.map((city) => (
            <div key={city} className={cn(
              "p-4 rounded-xl text-center",
              "bg-surface border border-border/30"
            )}>
              <div className="text-2xl font-bold text-text-primary">
                {clinics.filter((c) => c.city === city).length}
              </div>
              <div className="text-xs text-text-tertiary mt-1">{city}</div>
            </div>
          ))}
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: DURATIONS.base / 1000 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas ({clinics.length})
          </Button>
          {cities.map((city) => (
            <Button
              key={city}
              variant={filter === city ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(city)}
            >
              {city} ({clinics.filter((c) => c.city === city).length})
            </Button>
          ))}
        </motion.div>

        {/* Clinics Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: DURATIONS.base / 1000 }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-4 py-4 text-left text-sm font-semibold text-text-tertiary uppercase">
                  Nombre
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-text-tertiary uppercase">
                  Ciudad
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-text-tertiary uppercase">
                  Zona
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-text-tertiary uppercase">
                  Rating
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-text-tertiary uppercase">
                  Servicios
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-text-tertiary uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.map((clinic, idx) => (
                <motion.tr
                  key={clinic.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border/20 hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm font-medium text-text-primary">
                    {clinic.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{clinic.city}</td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{clinic.neighborhood}</td>
                  <td className="px-4 py-4 text-sm">
                    <Badge className="bg-warning/20 border-warning/50 text-warning">
                      ⭐ {clinic.rating.toFixed(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {clinic.services.slice(0, 2).map((service) => (
                        <Badge
                          key={service}
                          className="bg-secondary/10 border-secondary/30 text-secondary text-xs"
                        >
                          {service}
                        </Badge>
                      ))}
                      {clinic.services.length > 2 && (
                        <Badge className="bg-surface border-border/30 text-text-tertiary text-xs">
                          +{clinic.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingClinic(clinic);
                        setShowForm(true);
                      }}
                      className="gap-1"
                    >
                      <Edit2 size={14} />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClinic(clinic.id)}
                      className="gap-1 border-warning/30 hover:bg-warning/10 text-warning"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredClinics.length === 0 && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-text-tertiary mb-4 opacity-50" />
              <p className="text-text-secondary">No hay veterinarias en este filtro</p>
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
}
