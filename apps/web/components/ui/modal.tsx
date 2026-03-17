"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-navy/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <section role="dialog" aria-modal="true" aria-label={title} className="surface relative z-10 w-full max-w-md p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            className="inline-flex rounded-md border border-line p-2 text-soft hover:text-navy"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}
