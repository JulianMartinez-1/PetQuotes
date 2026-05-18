"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop cinematográfico */}
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal premium */}
      <section role="dialog" aria-modal="true" aria-label={title} className={cn("relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-dark p-6 shadow-elevation-lg backdrop-blur-xl", className)}>
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-text-secondary">{children}</div>
      </section>
    </div>
  );
}
