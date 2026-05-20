import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputSize = "sm" | "base" | "lg";
type InputProps = InputHTMLAttributes<HTMLInputElement> & { size?: InputSize; variant?: "default" | "outline" | "subtle" };

export function Input(props: InputProps) {
  const { size = "base", variant = "default", className, ...rest } = props;
  const sizes = { sm: "h-9 px-3 text-xs", base: "h-11 px-4 text-sm", lg: "h-13 px-5 text-base" };
  const variants = {
    default: "bg-surface-light border border-border/50 text-foreground placeholder:text-text-tertiary focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all",
    outline: "bg-surface border-2 border-border/70 text-foreground placeholder:text-text-tertiary focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all",
    subtle: "bg-surface border border-border/20 text-foreground placeholder:text-text-tertiary focus:border-secondary/70 focus:ring-2 focus:ring-secondary/20 transition-all"
  };
  return <input {...rest} className={cn("w-full rounded-lg outline-none transition-all duration-200 focus-visible:outline-none backdrop-blur-sm", sizes[size], variants[variant], className)} />;
}
