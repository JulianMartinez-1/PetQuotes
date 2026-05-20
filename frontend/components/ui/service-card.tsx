"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  color?: "primary" | "secondary" | "mint" | "accent";
  delay?: number;
  className?: string;
}

const colorMap = {
  primary: {
    bg: "bg-primary/5",
    border: "border-primary/20",
    text: "text-primary",
    glow: "shadow-lg shadow-primary/20 hover:shadow-primary/40",
    accent: "bg-primary/10",
    icon: "text-primary",
  },
  secondary: {
    bg: "bg-secondary/5",
    border: "border-secondary/20",
    text: "text-secondary",
    glow: "shadow-lg shadow-secondary/20 hover:shadow-secondary/40",
    accent: "bg-secondary/10",
    icon: "text-secondary",
  },
  mint: {
    bg: "bg-mint/5",
    border: "border-mint/20",
    text: "text-mint",
    glow: "shadow-lg shadow-mint/20 hover:shadow-mint/40",
    accent: "bg-mint/10",
    icon: "text-mint",
  },
  accent: {
    bg: "bg-accent/5",
    border: "border-accent/20",
    text: "text-accent",
    glow: "shadow-lg shadow-accent/20 hover:shadow-accent/40",
    accent: "bg-accent/10",
    icon: "text-accent",
  },
};

export function ServiceCard({
  icon,
  title,
  description,
  href,
  color = "primary",
  delay = 0,
  className,
}: ServiceCardProps) {
  const colors = colorMap[color];

  return (
    <Link href={href as any}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -12, scale: 1.03 }}
        transition={{
          duration: DURATIONS.base / 1000,
          delay,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        viewport={{ once: true, amount: 0.3 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl",
          "border transition-all duration-300",
          "p-8 h-full flex flex-col gap-4",
          "cursor-pointer",
          colors.bg,
          colors.border,
          colors.glow,
          className
        )}
      >
        {/* Gradient Background Accent */}
        <motion.div
          className={cn(
            "absolute -inset-full opacity-0 group-hover:opacity-20 transition-opacity duration-500",
            "bg-gradient-to-br",
            color === "primary" && "from-primary via-transparent to-secondary",
            color === "secondary" && "from-secondary via-transparent to-mint",
            color === "mint" && "from-mint via-transparent to-accent",
            color === "accent" && "from-accent via-transparent to-primary"
          )}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4 flex-1">
          {/* Icon */}
          <motion.div
            className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
              colors.accent,
              "group-hover:scale-110 transition-transform duration-300"
            )}
            whileHover={{ rotate: 10 }}
          >
            {icon}
          </motion.div>

          {/* Title */}
          <motion.h3
            className={cn(
              "text-xl font-bold",
              colors.text,
              "group-hover:translate-x-1 transition-transform duration-300"
            )}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <p className="text-sm text-text-secondary flex-1">
            {description}
          </p>
        </div>

        {/* Learn More Button */}
        <motion.div
          className="relative z-10 flex items-center gap-2 text-sm font-semibold"
          initial={{ opacity: 0.7 }}
          whileHover={{ opacity: 1 }}
        >
          <span className={cn("group-hover:translate-x-1 transition-transform duration-300", colors.text)}>
            Más información
          </span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={colors.text}
          >
            <ArrowRight size={16} />
          </motion.div>
        </motion.div>

        {/* Top accent line */}
        <motion.div
          className={cn(
            "absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500",
            color === "primary" && "bg-gradient-to-r from-primary to-transparent",
            color === "secondary" && "bg-gradient-to-r from-secondary to-transparent",
            color === "mint" && "bg-gradient-to-r from-mint to-transparent",
            color === "accent" && "bg-gradient-to-r from-accent to-transparent"
          )}
        />
      </motion.div>
    </Link>
  );
}

export default ServiceCard;

