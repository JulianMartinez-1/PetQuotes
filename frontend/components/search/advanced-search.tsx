"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLINIC_CATALOG } from "@/lib/clinic-catalog";

interface SearchSuggestion {
  type: "neighborhood" | "city" | "clinic" | "service";
  value: string;
  label: string;
  city?: string;
  count?: number;
}

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCity: (city: string) => void;
  onSelectNeighborhood?: (neighborhood: string, city: string) => void;
  onSelectClinic?: (clinicId: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch({
  value,
  onChange,
  onSelectCity,
  onSelectNeighborhood,
  onSelectClinic,
  placeholder = "Busca por barrio, ciudad, clínica o servicio...",
  className,
}: AdvancedSearchProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generar sugerencias
  useEffect(() => {
    const generateSuggestions = () => {
      const query = value.trim().toLowerCase();
      
      if (query.length === 0) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      
      // Simular un pequeño delay para ver la animación
      const timer = setTimeout(() => {
        const results: SearchSuggestion[] = [];

        // Búsqueda de barrios
        const neighborhoodsSet = new Set<string>();
        const neighborhoodCities: { [key: string]: string } = {};
        
        CLINIC_CATALOG.forEach((clinic) => {
          if (clinic.neighborhood.toLowerCase().includes(query)) {
            neighborhoodsSet.add(clinic.neighborhood);
            neighborhoodCities[clinic.neighborhood] = clinic.city;
          }
        });

        neighborhoodsSet.forEach((neighborhood) => {
          results.push({
            type: "neighborhood",
            value: neighborhood,
            label: `${neighborhood}`,
            city: neighborhoodCities[neighborhood],
          });
        });

        // Búsqueda de ciudades
        const citiesSet = new Set<string>();
        const cityCounts: { [key: string]: number } = {};
        
        CLINIC_CATALOG.forEach((clinic) => {
          if (clinic.city.toLowerCase().includes(query)) {
            citiesSet.add(clinic.city);
            cityCounts[clinic.city] = (cityCounts[clinic.city] || 0) + 1;
          }
        });

        citiesSet.forEach((city) => {
          results.push({
            type: "city",
            value: city,
            label: `${city}`,
            count: cityCounts[city],
          });
        });

        // Búsqueda de clínicas
        CLINIC_CATALOG.forEach((clinic) => {
          if (
            clinic.name.toLowerCase().includes(query) ||
            clinic.description.toLowerCase().includes(query)
          ) {
            results.push({
              type: "clinic",
              value: clinic.id,
              label: `${clinic.name} • ${clinic.neighborhood}, ${clinic.city}`,
              city: clinic.city,
            });
          }
        });

        // Búsqueda de servicios
        const servicesSet = new Set<string>();
        const serviceCounts: { [key: string]: number } = {};
        
        CLINIC_CATALOG.forEach((clinic) => {
          clinic.services.forEach((service) => {
            if (service.toLowerCase().includes(query)) {
              servicesSet.add(service);
              serviceCounts[service] = (serviceCounts[service] || 0) + 1;
            }
          });
        });

        servicesSet.forEach((service) => {
          results.push({
            type: "service",
            value: service,
            label: `${service} • ${serviceCounts[service]} clínicas`,
            count: serviceCounts[service],
          });
        });

        setSuggestions(results.slice(0, 12)); // Máximo 12 sugerencias
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    };

    generateSuggestions();
  }, [value]);

  // Cerrar cuando hago click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "city") {
      onSelectCity(suggestion.value);
      onChange("");
      setIsOpen(false);
    } else if (suggestion.type === "neighborhood" && onSelectNeighborhood) {
      onSelectNeighborhood(suggestion.value, suggestion.city || "");
      onChange("");
      setIsOpen(false);
    } else if (suggestion.type === "clinic" && onSelectClinic) {
      onSelectClinic(suggestion.value);
      onChange("");
      setIsOpen(false);
    } else {
      onChange(suggestion.label);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input */}
      <div className="relative flex items-center">
        <MapPin
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60 pointer-events-none"
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => value.length > 0 && setIsOpen(true)}
          className={cn(
            "w-full pl-12 pr-10 h-14 text-base",
            "rounded-xl border border-border/30 bg-surface/50 backdrop-blur-sm",
            "text-text-primary placeholder:text-text-secondary",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "transition-all duration-200"
          )}
        />
        {/* Clear button */}
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X size={18} className="text-text-secondary" />
          </motion.button>
        )}
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute right-3"
          >
            <Loader size={18} className="text-primary" />
          </motion.div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 z-50",
              "rounded-xl border border-border/30 bg-surface/95 backdrop-blur-md",
              "shadow-2xl overflow-hidden"
            )}
          >
            <div className="max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    "border-b border-border/10 last:border-b-0",
                    "hover:bg-surface-hover/50 group",
                    "flex items-center justify-between gap-2"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {suggestion.type === "city" && (
                      <MapPin size={16} className="text-secondary flex-shrink-0" />
                    )}
                    {suggestion.type === "neighborhood" && (
                      <MapPin size={16} className="text-mint flex-shrink-0" />
                    )}
                    {suggestion.type === "clinic" && (
                      <Search size={16} className="text-primary flex-shrink-0" />
                    )}
                    {suggestion.type === "service" && (
                      <Search size={16} className="text-accent flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {suggestion.label}
                      </p>
                      {suggestion.type === "neighborhood" && suggestion.city && (
                        <p className="text-xs text-text-secondary">{suggestion.city}</p>
                      )}
                    </div>
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-text-tertiary whitespace-nowrap">
                      {suggestion.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      {isOpen && value.length > 0 && suggestions.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "absolute top-full left-0 right-0 mt-2 z-50",
            "rounded-xl border border-border/30 bg-surface/95 backdrop-blur-md",
            "p-4 text-center text-sm text-text-secondary"
          )}
        >
          No encontramos resultados para &quot;{value}&quot;
        </motion.div>
      )}
    </div>
  );
}
