import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-brand text-white hover:bg-[#0E7799]",
    secondary: "bg-accent text-navy hover:bg-[#F6C14E]",
    ghost: "bg-white text-navy border border-line hover:bg-sky"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
