"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, Phone, Globe, Loader2 } from "lucide-react";
import { clinicsService, type ClinicResponse } from "@/lib/services-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpecializedClinicsProps {
  serviceType: string;
  serviceTitle: string;
  limit?: number;
  className?: string;
}

export function SpecializedClinics({
  serviceType,
  serviceTitle,
  limit = 6,
  className,
}: SpecializedClinicsProps) {
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        // Fetch verified clinics (you can add more sophisticated filtering in the backend)
        const data = await clinicsService.getVerified(1, limit);
        setClinics(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching clinics:", err);
        setError("No pudimos cargar las clínicas. Intenta nuevamente.");
        // Set mock data as fallback
        setClinics(getMockClinics(limit));
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, [serviceType, limit]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className={cn("py-20 relative overflow-hidden", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-text-primary">
            Clínicas Especializadas en <span className="text-primary">{serviceTitle}</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Elige entre nuestras mejores clínicas verificadas, con profesionales
            certificados y excelentes calificaciones
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-text-secondary">Cargando clínicas...</p>
            </div>
          </motion.div>
        ) : error && clinics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-surface-light rounded-xl border border-border/50 p-8"
          >
            <p className="text-text-secondary mb-4">{error}</p>
            <Link href="/clinics">
              <Button variant="primary">Ver todas las clínicas</Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Clinics Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {clinics.map((clinic, index) => (
                <motion.div
                  key={clinic.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link href={`/clinics/${clinic.id}`}>
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-2xl border transition-all duration-300",
                        "p-6 bg-surface-light border-border/50",
                        "group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20",
                        "cursor-pointer h-full flex flex-col"
                      )}
                    >
                      {/* Header with Rating */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                            {clinic.name}
                          </h3>
                          {clinic.isVerified && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="w-2 h-2 rounded-full bg-green" />
                              <span className="text-xs font-semibold text-green">
                                Verificada
                              </span>
                            </div>
                          )}
                        </div>
                        {clinic.logo && (
                          <img
                            src={clinic.logo}
                            alt={clinic.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={cn(
                                "transition-colors",
                                i < Math.floor(clinic.rating)
                                  ? "fill-warning text-warning"
                                  : "text-border"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-text-secondary">
                          {clinic.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-secondary mb-6 flex-1 line-clamp-2">
                        {clinic.description}
                      </p>

                      {/* Contact Info */}
                      <div className="space-y-3 mb-6 border-t border-border/30 pt-4">
                        {clinic.phone && (
                          <div className="flex items-center gap-3 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            <Phone size={16} className="text-primary" />
                            <span>{clinic.phone}</span>
                          </div>
                        )}
                        {clinic.email && (
                          <div className="flex items-center gap-3 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            <Globe size={16} className="text-green" />
                            <span className="truncate">{clinic.email}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button
                        variant="gradient"
                        size="sm"
                        className="w-full group-hover:scale-105 transition-transform"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mt-12"
            >
              <Link href="/clinics">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Ver todas las clínicas
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

// Mock data for development
function getMockClinics(count: number): ClinicResponse[] {
  const clinics: ClinicResponse[] = [
    {
      id: "1",
      ownerUserId: "owner1",
      name: "Clínica Veterinaria El Prado",
      description: "Servicio integral con equipamiento de última generación",
      email: "info@elprado.com",
      phone: "+34 600 123 456",
      website: "www.elprado.com",
      licenseNumber: "VET-001",
      logo: "█",
      rating: 4.8,
      isVerified: true,
    },
    {
      id: "2",
      ownerUserId: "owner2",
      name: "Centro Médico Veterinario Salud Animal",
      description: "Especialistas en medicina preventiva y urgencias",
      email: "contacto@saludanimal.com",
      phone: "+34 601 234 567",
      website: "www.saludanimal.com",
      licenseNumber: "VET-002",
      logo: "█",
      rating: 4.7,
      isVerified: true,
    },
    {
      id: "3",
      ownerUserId: "owner3",
      name: "Veterinaria Mascotas Felices",
      description: "Cuidado profesional con toque familiar",
      email: "info@mascotasfelices.com",
      phone: "+34 602 345 678",
      website: "www.mascotasfelices.com",
      licenseNumber: "VET-003",
      logo: "█",
      rating: 4.9,
      isVerified: true,
    },
  ];

  return clinics.slice(0, count);
}

