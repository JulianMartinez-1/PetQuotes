"use client";

import { motion } from "framer-motion";
import { User, Building2, Stethoscope, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectedRole = "CLIENT" | "CLINIC" | "INDEPENDENT";

interface RoleSelectorProps {
  selected: SelectedRole | null;
  onChange: (role: SelectedRole) => void;
}

const ROLES: {
  id: SelectedRole;
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
  gradient: string;
  border: string;
}[] = [
  {
    id: "CLIENT",
    icon: User,
    title: "Usuario",
    description: "Busco veterinarias y gestiono la salud de mi mascota",
    badge: "Dueño de mascota",
    gradient: "from-primary-600/10 to-secondary-600/10",
    border: "border-primary-600",
  },
  {
    id: "CLINIC",
    icon: Building2,
    title: "Veterinaria",
    description: "Registro mi clínica o hospital veterinario",
    badge: "Establecimiento",
    gradient: "from-mint/10 to-secondary-600/10",
    border: "border-mint",
  },
  {
    id: "INDEPENDENT",
    icon: Stethoscope,
    title: "Veterinario independiente",
    description: "Ofrezco servicios veterinarios por cuenta propia",
    badge: "Profesional",
    gradient: "from-accent/10 to-primary-600/10",
    border: "border-accent",
  },
];

export function RoleSelector({ selected, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      {ROLES.map((role) => {
        const Icon = role.icon;
        const isSelected = selected === role.id;

        return (
          <motion.button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "w-full text-left rounded-xl border-2 p-4 transition-all duration-200 relative",
              "bg-surface hover:bg-surface-light",
              isSelected
                ? `${role.border} bg-gradient-to-r ${role.gradient}`
                : "border-border hover:border-border-light",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-white/60 dark:bg-white/10" : "bg-surface-light",
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    isSelected ? "text-text-primary" : "text-text-muted",
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-text-primary">{role.title}</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-surface-light text-text-tertiary">
                    {role.badge}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{role.description}</p>
              </div>

              {isSelected && (
                <CheckCircle2
                  size={18}
                  className="shrink-0 mt-0.5 text-primary-600"
                />
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
