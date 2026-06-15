import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputSize = "sm" | "base" | "lg";
type InputProps = InputHTMLAttributes<HTMLInputElement> & { size?: InputSize; variant?: "default" | "outline" | "subtle" };

export function Input(props: InputProps) {
  const { size = "base", variant = "default", className, ...rest } = props;
  const sizes = { sm: "h-9 px-3 text-xs", base: "h-11 px-4 text-sm", lg: "h-13 px-5 text-base" };
  const variants = {
    default: "bg-surface border border-border-light text-text-primary placeholder:text-text-muted focus:border-secondary-600 focus:ring-2 focus:ring-secondary-200 transition-all dark:bg-dark-surface dark:border-border-dark dark:text-white dark:placeholder:text-text-tertiary dark:focus:ring-secondary-950",
    outline: "bg-surface border-2 border-border text-text-primary placeholder:text-text-tertiary focus:border-secondary-600 focus:ring-2 focus:ring-secondary-200 transition-all dark:bg-dark-surface dark:border-dark-surface-2 dark:text-white dark:focus:ring-secondary-950",
    subtle: "bg-surface-light border border-border-light text-text-primary placeholder:text-text-muted focus:border-secondary-600 focus:ring-2 focus:ring-secondary-100 transition-all dark:bg-dark-surface-2 dark:border-dark-surface-2 dark:text-white dark:focus:ring-secondary-950"
  };
  return <input {...rest} className={cn("w-full rounded-lg outline-none transition-all duration-200 focus-visible:outline-none backdrop-blur-sm", sizes[size], variants[variant], className)} />;
}
