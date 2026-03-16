import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-brand text-white hover:opacity-90",
    secondary: "bg-sky text-navy hover:bg-[#dbe7ff]",
    ghost: "bg-white text-navy border border-[#d5ddf0] hover:bg-sky"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
