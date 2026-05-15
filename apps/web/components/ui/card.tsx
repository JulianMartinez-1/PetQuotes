import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "gradient" | "elevated" | "outline";
type CardProps = PropsWithChildren<{ className?: string; variant?: CardVariant; interactive?: boolean }>;

export function Card({ children, className, variant = "default", interactive = false }: CardProps) {
  const variants = {
    default: "bg-surface-light border border-border/50 backdrop-blur-lg",
    gradient: "bg-gradient-card border border-cyan/20 backdrop-blur-xl",
    elevated: "bg-surface border border-border/30 shadow-elevation-lg",
    outline: "bg-dark border-2 border-cyan/30 backdrop-blur-md"
  };

  return <div className={cn("rounded-2xl p-6 transition-all duration-300", variants[variant], interactive && "hover:border-cyan/50 hover:shadow-glow-md hover:-translate-y-1 cursor-pointer", className)}>{children}</div>;
}
