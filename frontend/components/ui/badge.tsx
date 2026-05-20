import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "secondary" | "accent";
type BadgeSize = "sm" | "base";

type BadgeProps = PropsWithChildren<{
  className?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}>;

export function Badge({ children, className, variant = "default", size = "base" }: BadgeProps) {
  const variants = {
    default: "bg-surface-light border border-border/50 text-text-secondary",
    success: "bg-success/10 border border-success/30 text-success",
    warning: "bg-warning/10 border border-warning/30 text-warning",
    danger: "bg-danger/10 border border-danger/30 text-danger",
    secondary: "bg-secondary/10 border border-secondary/30 text-secondary",
    accent: "bg-accent/10 border border-accent/30 text-accent"
  };

  const sizes = {
    sm: "px-2 py-1 text-xs font-semibold",
    base: "px-3 py-1.5 text-sm font-semibold"
  };

  return (
    <span className={cn("inline-flex items-center rounded-full", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

