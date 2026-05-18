import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  count?: number;
  variant?: "text" | "circle" | "rect" | "card";
};

export function Skeleton({ className, count = 1, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circle: "h-10 w-10 rounded-full",
    rect: "h-40 rounded-lg",
    card: "h-64 rounded-2xl"
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className={cn("animate-shimmer bg-gradient-to-r from-surface via-surface-light to-surface bg-[length:1000px_100%]", variants[variant], className)} />
      ))}
    </>
  );
}
