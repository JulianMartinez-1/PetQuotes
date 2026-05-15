"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DURATIONS } from "@/constants/animations";
import { FeatureCard } from "@/components/ui/feature-card";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ServiceWithLink {
  icon: ReactNode;
  title: string;
  description: string;
  color?: "orange" | "green" | "teal" | "success" | "warning";
  href: string;
}

interface ServicesGridProps {
  title?: string;
  subtitle?: string;
  services: ServiceWithLink[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ServicesGrid({
  title,
  subtitle,
  services,
  columns = 4,
  className,
}: ServicesGridProps) {
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
            >
              {title}
            </motion.h2>
            {subtitle && (
              <p className="text-xl text-textSecondary max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className={cn("grid grid-cols-1 gap-6", columnMap[columns])}
        >
          {services.map((service, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Link href={service.href}>
                <motion.div
                  className="h-full group relative cursor-pointer"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Gradient Glow on Hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange/20 to-teal/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Card */}
                  <div className="relative h-full bg-white rounded-2xl border-2 border-border p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col h-full justify-between">
                      {/* Top Content */}
                      <div>
                        <motion.div
                          className="text-5xl mb-4 inline-block"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {service.icon}
                        </motion.div>

                        <h3 className="text-2xl font-black text-textPrimary mb-3">
                          {service.title}
                        </h3>

                        <p className="text-textSecondary leading-relaxed mb-6">
                          {service.description}
                        </p>
                      </div>

                      {/* Bottom - Learn More Link */}
                      <motion.div
                        className="flex items-center gap-2 text-sm font-bold text-textSecondary group-hover:text-textPrimary transition-colors"
                        initial={{ opacity: 0.6 }}
                        whileHover={{ opacity: 1 }}
                      >
                        Conocer más
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={16} />
                        </motion.span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
