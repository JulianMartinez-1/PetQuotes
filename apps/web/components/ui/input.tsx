import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
        props.className
      )}
    />
  );
}
