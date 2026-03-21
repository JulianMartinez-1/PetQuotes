import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-brand text-white shadow-[0_10px_24px_rgba(17,138,178,0.28)] hover:bg-[#0E7799] hover:shadow-[0_14px_28px_rgba(17,138,178,0.32)]",
    secondary: "bg-accent text-navy shadow-[0_8px_18px_rgba(255,209,102,0.36)] hover:bg-[#F6C14E]",
    ghost: "bg-white text-navy border border-line hover:bg-sky"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
