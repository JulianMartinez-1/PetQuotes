"use client";

import { MapPin, Home, Ruler } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { VeterinaryIndependentData } from "@/lib/auth-api";

interface VeterinaryIndependentFormProps {
  value: Partial<VeterinaryIndependentData>;
  onChange: (data: Partial<VeterinaryIndependentData>) => void;
}

export function VeterinaryIndependentForm({ value, onChange }: VeterinaryIndependentFormProps) {
  const set = (patch: Partial<VeterinaryIndependentData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      {/* Service area */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Zona de atención <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
          <Input
            type="text"
            placeholder="Ej: Bogotá Norte – Chapinero, Usaquén, Suba"
            value={value.serviceArea ?? ""}
            onChange={(e) => set({ serviceArea: e.target.value })}
            className="pl-10"
            variant="default"
            required
          />
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Describe los barrios o zonas donde puedes atender.
        </p>
      </div>

      {/* Home visits toggle */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          ¿Ofreces servicio a domicilio?
        </label>
        <div className="flex gap-2">
          {[
            { val: true, label: "Sí" },
            { val: false, label: "No" },
          ].map(({ val, label }) => {
            const selected = (value.homeVisits ?? false) === val;
            return (
              <button
                key={String(val)}
                type="button"
                onClick={() => set({ homeVisits: val, coverageRadius: val ? value.coverageRadius : undefined })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150",
                  selected
                    ? "border-primary-600 bg-primary-600/8 text-primary-600"
                    : "border-border bg-surface text-text-secondary hover:border-primary-600/50",
                )}
              >
                <Home size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coverage radius — only if home visits */}
      {value.homeVisits && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Radio de cobertura (km)
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
            <Input
              type="number"
              min={1}
              max={100}
              placeholder="10"
              value={value.coverageRadius ?? ""}
              onChange={(e) =>
                set({ coverageRadius: e.target.value ? Number(e.target.value) : undefined })
              }
              className="pl-10"
              variant="default"
            />
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Distancia máxima desde tu zona base.
          </p>
        </div>
      )}
    </div>
  );
}
