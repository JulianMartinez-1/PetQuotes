"use client";

import { motion } from "framer-motion";
import { MapPin, Star, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  address: string;
  distance: string;
  hours: string;
  badge?: string;
  color: "orange" | "green" | "teal" | "warning";
}

interface SpecializedClinicsProps {
  title?: string;
  clinics: Clinic[];
  color?: "orange" | "green" | "teal" | "warning";
}

const colorMap = {
  orange: {
    badge: "bg-orange/10 text-orange border-orange/30",
    button: "bg-orange hover:bg-orange-dark text-white",
    star: "text-orange",
    header: "text-orange",
  },
  green: {
    badge: "bg-green/10 text-green border-green/30",
    button: "bg-green hover:bg-green-dark text-white",
    star: "text-green",
    header: "text-green",
  },
  teal: {
    badge: "bg-teal/10 text-teal border-teal/30",
    button: "bg-teal hover:bg-teal-dark text-white",
    star: "text-teal",
    header: "text-teal",
  },
  warning: {
    badge: "bg-warning/10 text-warning border-warning/30",
    button: "bg-warning hover:bg-warning-dark text-white",
    star: "text-warning",
    header: "text-warning",
  },
};

export function SpecializedClinics({
  title = "Clínicas Especializadas Recomendadas",
  clinics,
  color = "orange",
}: SpecializedClinicsProps) {
  const colors = colorMap[color];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className={cn("text-4xl sm:text-5xl font-black mb-4", colors.header)}>
            {title}
          </h2>
          <p className="text-textSecondary text-lg max-w-2xl mx-auto">
            Seleccionadas y verificadas para ofrecerte el mejor servicio
          </p>
        </motion.div>

        {/* Clinics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {clinics.map((clinic) => (
            <motion.div
              key={clinic.id}
              variants={itemVariants}
              className="group relative"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange/20 to-teal/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative h-full bg-white rounded-2xl border-2 border-border p-6 hover:shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-textPrimary mb-1">
                      {clinic.name}
                    </h3>
                    <p className="text-sm text-textSecondary mb-3">
                      {clinic.specialty}
                    </p>
                  </div>
                  {clinic.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border",
                        colors.badge
                      )}
                    >
                      {clinic.badge}
                    </motion.div>
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
                          i < Math.floor(clinic.rating)
                            ? colors.star
                            : "text-border",
                          "fill-current transition-colors"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-textPrimary">
                    {clinic.rating}
                  </span>
                  <span className="text-xs text-textTertiary">
                    ({clinic.reviews} reseñas)
                  </span>
                </div>

                {/* Info Items */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-textSecondary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-textSecondary leading-snug">
                        {clinic.address}
                      </p>
                      <p className="text-xs text-textTertiary mt-1">
                        {clinic.distance}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-textSecondary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-textSecondary">
                      {clinic.hours}
                    </p>
                  </div>
                </div>

                {/* Button */}
                <Button
                  className={cn(
                    "w-full font-semibold",
                    colors.button
                  )}
                >
                  Agendar Cita
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
