"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ClinicCatalogItem } from "@/lib/clinic-catalog";
import { getClinicsFromStorage, saveClinicsToStorage } from "@/lib/clinic-storage";

interface CSVImportProps {
  onImportComplete?: (count: number) => void;
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [preview, setPreview] = useState<ClinicCatalogItem[]>([]);

  const parseCSV = (text: string): ClinicCatalogItem[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) throw new Error("CSV debe tener encabezado y al menos una fila de datos");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredFields = [
      "name",
      "city",
      "neighborhood",
      "latitude",
      "longitude",
      "phone",
      "rating",
      "distancekm",
      "image",
      "description",
    ];

    const missingFields = requiredFields.filter((field) => !headers.includes(field));
    if (missingFields.length > 0) {
      throw new Error(`Faltan columnas: ${missingFields.join(", ")}`);
    }

    const clinics: ClinicCatalogItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.every((v) => !v)) continue; // Skip empty lines

      const nameIndex = headers.indexOf("name");
      const cityIndex = headers.indexOf("city");
      const neighborhoodIndex = headers.indexOf("neighborhood");
      const latIndex = headers.indexOf("latitude");
      const lngIndex = headers.indexOf("longitude");
      const phoneIndex = headers.indexOf("phone");
      const ratingIndex = headers.indexOf("rating");
      const distanceIndex = headers.indexOf("distancekm");
      const imageIndex = headers.indexOf("image");
      const descIndex = headers.indexOf("description");
      const servicesIndex = headers.indexOf("services"); // optional

      const clinic: ClinicCatalogItem = {
        id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: values[nameIndex] || "Sin nombre",
        city: values[cityIndex] || "Bogota",
        neighborhood: values[neighborhoodIndex] || "Centro",
        latitude: parseFloat(values[latIndex]) || 4.7110,
        longitude: parseFloat(values[lngIndex]) || -74.0076,
        phone: values[phoneIndex] || "+57 (1) 0000 0000",
        rating: parseFloat(values[ratingIndex]) || 4.5,
        distanceKm: parseFloat(values[distanceIndex]) || 1.0,
        openNow: true,
        image: values[imageIndex] || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200&auto=format&fit=crop",
        description: values[descIndex] || "Clínica veterinaria importada",
        services: servicesIndex !== -1 && values[servicesIndex] ? values[servicesIndex].split("|").map((s) => s.trim()) : ["Consulta"],
      };

      clinics.push(clinic);
    }

    return clinics;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setMessage({ type: "error", text: "Por favor carga un archivo CSV" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const parsedClinics = parseCSV(text);
      setPreview(parsedClinics);
      setMessage({
        type: "success",
        text: `${parsedClinics.length} veterinarias listas para importar`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al procesar el CSV",
      });
      setPreview([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    try {
      const existing = getClinicsFromStorage();
      const combined = [...existing, ...preview];
      saveClinicsToStorage(combined);
      setMessage({
        type: "success",
        text: `✅ ${preview.length} veterinarias importadas exitosamente`,
      });
      setPreview([]);
      onImportComplete?.(preview.length);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error al guardar los datos",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-border/30 bg-surface/50 backdrop-blur-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-2">Importar Veterinarias desde CSV</h3>
        <p className="text-sm text-text-secondary">
          Carga un archivo CSV con columnas: name, city, neighborhood, latitude, longitude, phone, rating, distancekm, image, description
        </p>
      </div>

      {/* Upload Area */}
      <div className={cn(
        "mb-6 p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer",
        "hover:border-secondary/50 hover:bg-secondary/5"
      )}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={loading}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
          <Upload size={32} className="text-secondary/40" />
          <span className="text-sm font-medium text-text-secondary">
            Haz click o arrastra un CSV
          </span>
        </label>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mb-6 p-4 rounded-lg flex items-center gap-3",
            message.type === "success"
              ? "bg-success/10 border border-success/30 text-success"
              : "bg-warning/10 border border-warning/30 text-warning"
          )}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className="text-sm font-bold text-text-primary mb-3">
            Vista previa ({preview.length} veterinarias)
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2 mb-4 bg-dark/30 p-4 rounded-lg">
            {preview.slice(0, 5).map((clinic) => (
              <div key={clinic.id} className="text-xs text-text-secondary p-2 bg-surface/50 rounded">
                <strong>{clinic.name}</strong> • {clinic.city} • Rating: {clinic.rating}
              </div>
            ))}
            {preview.length > 5 && (
              <div className="text-xs text-text-tertiary p-2 italic">
                + {preview.length - 5} más...
              </div>
            )}
          </div>

          <Button
            variant="primary"
            onClick={handleConfirmImport}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Importando..." : `Confirmar Importación (${preview.length})`}
          </Button>
        </motion.div>
      )}

      {/* Download Template */}
      <div className="pt-6 border-t border-border/30">
        <p className="text-xs text-text-tertiary mb-3">Necesitas una plantilla CSV?</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const template = "name,city,neighborhood,latitude,longitude,phone,rating,distancekm,image,description,services\nEjemplo Vet,Bogota,Chapinero,4.738,-74.052,+57 (1) 3456 7890,4.9,1.8,https://images.unsplash.com/photo-1516734212186-a967f81ad0d7,Clínica ejemplo,Consulta|Vacunacion";
            const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "template-clinics.csv";
            link.click();
          }}
          className="w-full"
        >
          Descargar Plantilla CSV
        </Button>
      </div>
    </motion.div>
  );
}
