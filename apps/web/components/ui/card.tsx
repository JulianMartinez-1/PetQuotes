import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-2xl border border-[#e5eaf5] bg-white p-6 shadow-soft", className)}>{children}</div>;
}
