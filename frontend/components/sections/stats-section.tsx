"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description?: string;
  color?: "primary" | "secondary" | "mint" | "accent";
}

interface StatsGridProps {
  stats: Stat[];
  title?: string;
  subtitle?: string;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function StatsGrid({
  stats,
  title,
  subtitle,
  className,
  columns = 4,
}: StatsGridProps) {
  const columnMap = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  const colorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    mint: "text-mint",
    accent: "text-accent",
  };

  return (
    <section className={cn("py-20 relative overflow-hidden", className)}>
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className={cn(
              "text-5xl sm:text-6xl font-black mb-4",
              "bg-gradient-to-r from-primary via-secondary to-mint bg-clip-text text-transparent"
            )}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg font-semibold text-text-primary max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          className={cn("grid grid-cols-1 gap-8", columnMap[columns])}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
          viewport={{ once: false, amount: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: index * 0.08,
              }}
              viewport={{ once: false, amount: 0.3 }}
              className={cn(
                "relative overflow-hidden rounded-2xl p-8",
                "bg-surface border border-border/30",
                "hover:border-secondary/50 transition-all duration-300",
                "hover:shadow-lg hover:shadow-secondary/20"
              )}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
            >
              {/* Top Accent */}
              <motion.div
                className={cn(
                  "absolute top-0 left-0 h-1 w-12",
                  stat.color === "primary" && "bg-primary",
                  stat.color === "secondary" && "bg-secondary",
                  stat.color === "mint" && "bg-mint",
                  stat.color === "accent" && "bg-accent",
                )}
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Value with Countup */}
                <motion.div
                  className={cn(
                    "text-6xl sm:text-7xl font-black mb-3",
                    stat.color === "primary" && "text-primary",
                    stat.color === "secondary" && "text-secondary",
                    stat.color === "mint" && "text-mint",
                    stat.color === "accent" && "text-accent",
                    !stat.color && "text-primary"
                  )}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{
                    delay: index * 0.05 + 0.1,
                    duration: 0.6,
                  }}
                  viewport={{ once: false }}
                >
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.75}
                    separator=","
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    enableScrollSpy={true}
                    scrollSpyOnce={true}
                  />
                </motion.div>

                {/* Label */}
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {stat.label}
                </h3>

                {/* Description */}
                {stat.description && (
                  <p className="text-sm font-medium text-text-secondary">
                    {stat.description}
                  </p>
                )}
              </div>

              {/* Background Accent */}
              <motion.div
                className={cn(
                  "absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10",
                  stat.color === "primary" && "bg-primary",
                  stat.color === "secondary" && "bg-secondary",
                  stat.color === "mint" && "bg-mint",
                  stat.color === "accent" && "bg-accent",
                )}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );

}

// Single Stat Card (for use in different contexts)
export function StatCard({
  value,
  label,
  icon: Icon,
  color = "primary",
  animate = true,
  delay = 0,
}: {
  value: number;
  label: string;
  icon?: any;
  color?: "primary" | "green" | "teal" | "success" | "warning";
  animate?: boolean;
  delay?: number;
}) {
  const colorMap = {
    primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
    green: { bg: "bg-green/10", text: "text-green", border: "border-green/30" },
    teal: { bg: "bg-teal/10", text: "text-teal", border: "border-teal/30" },
    success: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
    warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl p-6",
        colors.bg,
        "border",
        colors.border,
        "hover:border-current transition-all duration-300"
      )}
      initial={animate ? { opacity: 0, scale: 0.9 } : undefined}
      whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
      whileHover={animate ? { y: -2 } : undefined}
      transition={{
        duration: DURATIONS.base,
        delay,
      }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={cn("text-3xl font-bold mb-1", colors.text)}>
            {animate ? (
              <CountUp
                start={0}
                end={value}
                duration={2.75}
                enableScrollSpy={true}
                scrollSpyOnce={true}
              />
            ) : (
              value
            )}
          </div>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
        {Icon && (
          <div className={cn("text-3xl opacity-20", colors.text)}>
            <Icon size={32} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

