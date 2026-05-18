"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { DURATIONS } from "@/constants/animations";
import { FeatureCard } from "@/components/ui/feature-card";
import { cn } from "@/lib/utils";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  color?: "orange" | "green" | "teal" | "success" | "warning";
}

interface FeaturesGridProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeaturesGrid({
  title,
  subtitle,
  features,
  columns = 3,
  className,
}: FeaturesGridProps) {
  const columnMap = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className={cn("py-20 relative overflow-hidden", className)}>
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-magenta rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <motion.h2
              className={cn(
                "text-5xl sm:text-6xl font-black mb-6",
                "bg-gradient-to-r from-orange via-green to-teal bg-clip-text text-transparent"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                className="text-lg font-semibold text-text-primary max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                viewport={{ once: false }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Features Grid */}
        <motion.div
          className={cn(
            "grid grid-cols-1 gap-8",
            columnMap[columns]
          )}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <FeatureCard
                {...feature}
                delay={index * 0.05}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Hero Features (2 column, larger)
export function HeroFeatures({
  features,
  title,
  subtitle,
}: {
  features: Array<Feature & { image?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATIONS.base }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className={cn(
            "text-3xl sm:text-4xl font-bold mb-4",
            "bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent"
          )}>
            {title}
          </h2>
          <p className="text-lg text-text-secondary max-w-xl">{subtitle}</p>
        </motion.div>

        {/* Features with Images */}
        <div className="space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: DURATIONS.base / 1000, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-12 items-center",
                index % 2 === 1 && "md:grid-flow-dense"
              )}
            >
              {/* Content */}
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  {feature.title}
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center gap-3 text-cyan font-medium">
                  <span>Learn more</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </div>

              {/* Image Placeholder */}
              {feature.image && (
                <motion.div
                  className={cn(
                    "relative h-64 md:h-80 rounded-xl",
                    "bg-gradient-to-br from-surface-light to-surface",
                    "border border-border/30 overflow-hidden",
                    index % 2 === 1 && "md:col-start-1 md:row-start-1"
                  )}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {feature.icon}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
