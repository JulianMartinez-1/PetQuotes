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
    primary:
      "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-md font-semibold transition-all dark:bg-primary-600 dark:hover:bg-primary-500",
    secondary:
      "bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white shadow-sm hover:shadow-md font-semibold transition-all dark:bg-secondary-600 dark:hover:bg-secondary-500",
    outline:
      "border-2 border-primary-600 text-primary-700 hover:bg-primary-50 active:bg-primary-100 font-semibold transition-all hover:border-primary-700 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-950/30",
    ghost:
      "text-text-secondary hover:bg-surface-2 hover:text-text-primary font-semibold transition-colors dark:text-slate-300 dark:hover:bg-dark-surface-2 dark:hover:text-white",
    danger:
      "bg-danger hover:bg-danger-dark active:bg-red-700 text-white shadow-sm hover:shadow-md font-semibold transition-all dark:bg-danger dark:hover:bg-red-600",
    glow:
      "bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 hover:border-primary-300 hover:shadow-md font-semibold transition-all dark:bg-primary-950/40 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-950/60",
    gradient:
      "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-secondary-700 font-semibold transition-all dark:from-primary-600 dark:to-secondary-600 dark:hover:from-primary-500 dark:hover:to-secondary-500",
  };

  const sizes = {
    xs: "px-3 py-1.5 text-xs gap-1.5",
    sm: "px-4 py-2 text-sm gap-2",
    base: "px-5 py-2.5 text-sm gap-2.5",
    lg: "px-6 py-3 text-base gap-3",
    xl: "px-8 py-4 text-lg gap-3",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-200",
        "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {props.children}
    </button>
  );
}
