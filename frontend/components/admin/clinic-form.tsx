"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ClinicCatalogItem } from "@/lib/clinic-catalog";
import { generateClinicId } from "@/lib/clinic-storage";

interface ClinicFormProps {
  clinic?: ClinicCatalogItem;
  onSubmit: (clinic: ClinicCatalogItem) => void;
  onCancel: () => void;
}

export function ClinicForm({ clinic, onSubmit, onCancel }: ClinicFormProps) {
  const [formData, setFormData] = useState<ClinicCatalogItem>(
    clinic || {
      id: generateClinicId(),
      name: "",
      city: "Bogota",
      neighborhood: "",
      latitude: 4.7110,
      longitude: -74.0076,
      phone: "+57 (1) ",
      rating: 4.5,
      distanceKm: 1.0,
      openNow: true,
      image: "",
      description: "",
      services: [],
    }
  );

  const [newService, setNewService] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? parseFloat(value) : value,
    }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.neighborhood || formData.services.length === 0) {
      alert("Completa todos los campos requeridos");
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl border border-border/30 bg-surface/50 backdrop-blur-sm space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">
          {clinic ? "Editar Veterinaria" : "Agregar Nueva Veterinaria"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <X size={20} className="text-text-secondary" />
        </button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Nombre *
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre de la clínica"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Teléfono
          </label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+57 (1) 0000 0000"
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Ciudad
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-3 rounded-lg border",
              "bg-surface border-border/30 text-text-primary",
              "text-sm font-medium"
            )}
          >
            <option value="Bogota">Bogota</option>
            <option value="Medellin">Medellin</option>
            <option value="Cali">Cali</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Barrio/Zona *
          </label>
          <Input
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            placeholder="Chapinero"
            required
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Latitud
          </label>
          <Input
            name="latitude"
            type="number"
            step="0.0001"
            value={formData.latitude}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Longitud
          </label>
          <Input
            name="longitude"
            type="number"
            step="0.0001"
            value={formData.longitude}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Rating & Distance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Rating (0-5)
          </label>
          <Input
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
            Distancia (km)
          </label>
          <Input
            name="distanceKm"
            type="number"
            step="0.1"
            value={formData.distanceKm}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
          URL de Imagen
        </label>
        <Input
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe la clínica..."
          rows={3}
          className={cn(
            "w-full px-4 py-3 rounded-lg border",
            "bg-surface border-border/30 text-text-primary",
            "focus:border-secondary focus:ring-secondary/20",
            "text-sm"
          )}
        />
      </div>

      {/* Services */}
      <div>
        <label className="text-xs font-semibold text-text-tertiary mb-2 block uppercase">
          Servicios *
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Ej: Consulta, Vacunacion"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addService();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addService}
            className="whitespace-nowrap"
          >
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.services.map((service) => (
            <Badge
              key={service}
              className="bg-secondary/20 border-secondary/50 text-secondary flex items-center gap-2 px-3 py-1"
            >
              {service}
              <button
                type="button"
                onClick={() => removeService(service)}
                className="hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Open Now */}
      <label className={cn(
        "px-4 py-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3",
        "bg-surface border-border/30 hover:border-secondary/50",
        "text-sm font-medium"
      )}>
        <input
          type="checkbox"
          name="openNow"
          checked={formData.openNow}
          onChange={handleChange}
          className="w-4 h-4 rounded cursor-pointer"
        />
        <span>Abierta ahora</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border/30">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button variant="primary" type="submit" className="flex-1">
          {clinic ? "Guardar Cambios" : "Agregar Veterinaria"}
        </Button>
      </div>
    </motion.form>
  );
}
