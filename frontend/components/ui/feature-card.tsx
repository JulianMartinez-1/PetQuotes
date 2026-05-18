"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { DURATIONS } from "@/constants/animations";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: "orange" | "green" | "teal" | "success" | "warning";
  gradient?: boolean;
  interactive?: boolean;
  delay?: number;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  color = "orange",
  gradient = false,
  interactive = true,
  delay = 0,
  className,
}: FeatureCardProps) {
  const colorMap = {
    orange: {
      bg: "bg-orange/5",
      border: "border-orange/20",
      text: "text-orange",
      glow: "shadow-lg shadow-orange/20 hover:shadow-orange/40",
      accent: "bg-orange/10",
    },
    green: {
      bg: "bg-green/5",
      border: "border-green/20",
      text: "text-green",
      glow: "shadow-lg shadow-green/20 hover:shadow-green/40",
      accent: "bg-green/10",
    },
    teal: {
      bg: "bg-teal/5",
      border: "border-teal/20",
      text: "text-teal",
      glow: "shadow-lg shadow-teal/20 hover:shadow-teal/40",
      accent: "bg-teal/10",
    },
    success: {
      bg: "bg-success/5",
      border: "border-success/20",
      text: "text-success",
      glow: "shadow-lg shadow-success/20 hover:shadow-success/40",
      accent: "bg-success/10",
    },
    warning: {
      bg: "bg-warning/5",
      border: "border-warning/20",
      text: "text-warning",
      glow: "shadow-lg shadow-warning/20 hover:shadow-warning/40",
      accent: "bg-warning/10",
    },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={interactive ? { y: -8, scale: 1.02 } : undefined}
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
        "p-8",
        gradient ? "bg-gradient-to-br from-surface to-surface-light" : "bg-surface",
        colors.border,
        colors.glow,
        interactive && "cursor-pointer",
        className
      )}
    >
      {/* Background Gradient Accent */}
      <motion.div
        className={cn(
          "absolute -inset-full opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          "bg-gradient-to-br",
          color === "orange" && "from-orange via-transparent to-green",
          color === "green" && "from-green via-transparent to-teal",
          color === "teal" && "from-teal via-transparent to-orange",
          color === "success" && "from-success via-transparent to-green",
          color === "warning" && "from-warning via-transparent to-orange",
        )}
      />

      {/* Top Accent Line */}
      <motion.div
        className={cn(
          "absolute top-0 left-0 h-1 w-12",
          color === "orange" && "bg-gradient-to-r from-orange to-green",
          color === "green" && "bg-gradient-to-r from-green to-teal",
          color === "teal" && "bg-gradient-to-r from-teal to-orange",
          color === "success" && "bg-gradient-to-r from-success to-green",
          color === "warning" && "bg-gradient-to-r from-warning to-orange",
        )}
        initial={{ width: 0 }}
        whileInView={{ width: 48 }}
        transition={{ delay: delay + 0.2, duration: 0.6 }}
        viewport={{ once: true }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon Container */}
        <motion.div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
            colors.accent,
            "border border-current border-opacity-30",
            "transition-all duration-300",
          )}
          whileHover={interactive ? { rotate: 12, scale: 1.1 } : undefined}
        >
          <div className={cn("text-2xl", colors.text)}>
            {icon}
          </div>
        </motion.div>

        {/* Title */}
        <h3 className={cn(
          "text-2xl font-bold text-text-primary mb-3",
          "group-hover:text-orange transition-colors duration-300"
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-text-primary font-medium text-base leading-relaxed">
          {description}
        </p>

        {/* Animated Arrow */}
        {interactive && (
          <motion.div
            className="mt-6 flex items-center gap-2 text-cyan text-sm font-medium"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            viewport={{ once: true }}
            whileHover={{ x: 4 }}
          >
            <span>Learn more</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Hover Border Glow */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "border",
          color === "orange" && "border-orange",
          color === "green" && "border-green",
          color === "teal" && "border-teal",
          color === "success" && "border-success",
          color === "warning" && "border-warning",
        )}
        initial={{ opacity: 0 }}
        whileHover={interactive ? { opacity: 0.3 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Preset Feature Card Variants
export function FeatureCardSmall(props: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: DURATIONS.base, delay: props.delay }}
      viewport={{ once: true }}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "border border-border/30 bg-surface/50 backdrop-blur-sm",
        "p-4 hover:border-orange/50 transition-all duration-300",
        "hover:bg-surface hover:shadow-lg hover:shadow-orange/20",
        props.className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className={cn("text-xl", props.color === "orange" && "text-orange", props.color === "green" && "text-green", props.color === "teal" && "text-teal")}>
            {props.icon}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-1">
            {props.title}
          </h4>
          <p className="text-xs text-text-tertiary leading-relaxed">
            {props.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
