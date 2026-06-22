"use client";

import { ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepIndicatorConfig = {
  current: number;
  total: number;
};

type ModalProps = {
  open: boolean;
  title: string;
  /** Secondary line shown below the title in the built-in header */
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  /** When true (default) the built-in title + X header is shown */
  showHeader?: boolean;
  /**
   * When provided, renders a "Paso X de N" label + animated progress bar
   * below the header. Any modal with a multi-step flow can pass this prop
   * to get a reusable step indicator without building its own.
   */
  stepIndicator?: StepIndicatorConfig;
  /**
   * String announced to screen readers via aria-live when the step changes.
   * Example: "Paso 3 de 5: elige el horario"
   */
  stepAnnouncement?: string;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  className,
  maxWidth = "max-w-md",
  showHeader = true,
  stepIndicator,
  stepAnnouncement,
}: ModalProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const getFocusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

    getFocusables()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      // Query live so new elements after step transitions are included
      const focusables = getFocusables();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const progress = stepIndicator
    ? Math.round((stepIndicator.current / stepIndicator.total) * 100)
    : null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative z-10 w-full rounded-2xl border border-border/50 bg-surface p-6 shadow-elevation-lg",
              maxWidth,
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Built-in header */}
            {showHeader && (
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  className="shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* ── Step progress indicator ──
                Reusable by any modal with a multi-step flow.
                Pass stepIndicator={{ current, total }} to activate. */}
            {stepIndicator && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-secondary tracking-wide">
                    Paso {stepIndicator.current} de {stepIndicator.total}
                  </span>
                  <span className="text-xs font-medium text-text-muted">{progress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={stepIndicator.current}
                  aria-valuemin={1}
                  aria-valuemax={stepIndicator.total}
                  aria-label={`Progreso: paso ${stepIndicator.current} de ${stepIndicator.total}`}
                  className="w-full h-1.5 bg-border/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-secondary rounded-full"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            {/* Accessible live region — announces step changes to screen readers */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {stepAnnouncement ?? ""}
            </div>

            {/* Content */}
            <div className={showHeader ? "text-text-secondary" : ""}>{children}</div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
