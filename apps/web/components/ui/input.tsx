import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-[#d5ddf0] bg-white px-4 text-sm outline-none focus:border-brand",
        props.className
      )}
    />
  );
}
