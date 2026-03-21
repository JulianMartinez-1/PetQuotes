import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line/90 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_36px_rgba(11,34,57,0.12)]",
        className
      )}
    >
      {children}
    </div>
  );
}
