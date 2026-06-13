import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "gradient" | "elevated" | "outline";
type CardProps = PropsWithChildren<{ className?: string; variant?: CardVariant; interactive?: boolean; onClick?: () => void }>;

export function Card({ children, className, variant = "default", interactive = false, onClick }: CardProps) {
  return <div onClick={onClick} className={cn("rounded-2xl p-6 transition-all duration-300", variants[variant], interactive && "hover:border-secondary/60 hover:shadow-lg hover:-translate-y-1 cursor-pointer", className)}>{children}</div>;
}

const variants = {
  default: "bg-surface border border-border/30 shadow-sm hover:shadow-md transition-shadow",
  gradient: "bg-gradient-to-br from-surface to-surface-light border border-secondary/20 shadow-md",
  elevated: "bg-surface border border-secondary/30 shadow-lg hover:shadow-xl transition-shadow",
  outline: "bg-surface border-2 border-secondary/40 shadow-sm hover:shadow-md transition-all"
};
