"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GeolocationDialogProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  loading?: boolean;
}

export function GeolocationDialog({
  isOpen,
  onAllow,
  onDeny,
  loading = false,
}: GeolocationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-40"
            onClick={onDeny}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className={cn(
              "relative rounded-2xl p-6",
              "bg-surface border border-border/30",
              "shadow-2xl"
            )}>
              {/* Close Button */}
              <button
                onClick={onDeny}
                className="absolute top-4 right-4 p-1 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <X size={20} className="text-text-secondary" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3, type: "spring" }}
                  className={cn(
                    "w-16 h-16 mx-auto mb-4 rounded-full",
                    "bg-secondary/10 border border-secondary/30",
                    "flex items-center justify-center"
                  )}
                >
                  <MapPin className="text-secondary" size={32} />
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-xl font-bold text-text-primary mb-2"
                >
                  Acceso a tu ubicación
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-sm text-text-secondary mb-6"
                >
                  Necesitamos acceso a tu ubicación para mostrarte las clínicas veterinarias más cercanas a ti. Si lo prefieres, también podemos mostrar las clínicas de tu ciudad.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="flex gap-3 flex-col sm:flex-row"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeny}
                    disabled={loading}
                    className="flex-1"
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onAllow}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Activando..." : "Permitir ubicación"}
                  </Button>
                </motion.div>

                {/* Info Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="text-xs text-text-tertiary mt-4"
                >
                  Esta información no se compartirá y solo se usará para esta sesión.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
