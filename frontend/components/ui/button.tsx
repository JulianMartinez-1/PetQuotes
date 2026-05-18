import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow" | "gradient";
type ButtonSize = "xs" | "sm" | "base" | "lg" | "xl";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

export function Button({ className, variant = "primary", size = "base", isLoading = false, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-orange hover:bg-orange-dark text-white shadow-glow-md hover:shadow-glow-lg font-semibold",
    secondary: "bg-green hover:bg-green-dark text-white shadow-glow-green hover:shadow-lg font-semibold",
    outline: "border border-orange text-orange hover:bg-orange/10 font-semibold",
    ghost: "text-text-primary hover:bg-surface-light font-medium",
    danger: "bg-danger hover:bg-red-700 text-white shadow-elevation-md hover:shadow-elevation-lg font-semibold",
    glow: "bg-orange/10 border border-orange text-orange hover:bg-orange/20 hover:shadow-glow-md font-semibold",
    gradient: "bg-gradient-warm text-white shadow-glow-lg hover:shadow-glow-lg font-semibold"
  };

  const sizes = {
    xs: "px-3 py-1.5 text-xs gap-1.5",
    sm: "px-4 py-2 text-sm gap-2",
    base: "px-5 py-3 text-sm gap-2.5",
    lg: "px-6 py-3.5 text-base gap-3",
    xl: "px-8 py-4 text-lg gap-3"
  };

  return (
    <button className={cn("inline-flex items-center justify-center rounded-xl transition-all duration-300 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], sizes[size], className)} disabled={disabled || isLoading} {...props}>
      {isLoading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
      {props.children}
    </button>
  );
}
