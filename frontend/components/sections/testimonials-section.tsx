"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { DURATIONS } from "@/constants/animations";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  image?: string;
  content: string;
  rating?: number;
  color?: "primary" | "secondary" | "mint" | "accent";
}

interface TestimonialsGridProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  className?: string;
  columns?: 2 | 3;
}

export function TestimonialsGrid({
  testimonials,
  title,
  subtitle,
  className,
  columns = 3,
}: TestimonialsGridProps) {
  const columnMap = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
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
      {/* Background */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
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
              "bg-gradient-to-r from-primary-600 via-secondary-400 to-mint-500 bg-clip-text text-transparent"
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

        {/* Grid */}
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
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <TestimonialCard testimonial={testimonial} delay={index * 0.05} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Single Testimonial Card
export function TestimonialCard({
  testimonial,
  delay = 0,
}: {
  testimonial: Testimonial;
  delay?: number;
}) {
  const colorMap = {
    primary: "border-primary/30 hover:border-primary/60 shadow-primary/20 hover:shadow-primary/40",
    secondary: "border-secondary/30 hover:border-secondary/60 shadow-secondary/20 hover:shadow-secondary/40",
    mint: "border-mint/30 hover:border-mint/60 shadow-mint/20 hover:shadow-mint/40",
    accent: "border-accent/30 hover:border-accent/60 shadow-accent/20 hover:shadow-accent/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{
        duration: DURATIONS.base / 1000,
        delay,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      viewport={{ once: true, amount: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-8",
        "bg-surface border",
        colorMap[testimonial.color || "primary"],
        "shadow-lg transition-all duration-300"
      )}
    >
      {/* Quote Mark Background */}
      <div className="absolute -top-8 -right-8 text-7xl opacity-5 text-secondary">
        &quot;
      </div>

      {/* Rating */}
      {testimonial.rating && (
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + i * 0.05 }}
              viewport={{ once: true }}
            >
              <Star
                size={16}
                className={cn(
                  i < (testimonial.rating || 0) ? "fill-warning text-warning" : "text-border"
                )}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Content */}
      <p className="text-text-primary mb-6 leading-relaxed italic font-medium text-base">
        &quot;{testimonial.content}&quot;
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        {testimonial.image && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-secondary/30"
          >
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              className="object-cover"
            />
          </motion.div>
        )}
        <div>
          <p className="font-bold text-text-primary text-base">
            {testimonial.name}
          </p>
          <p className="text-text-secondary font-medium text-sm">
            {testimonial.role}
            {testimonial.company && ` at ${testimonial.company}`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Carousel Testimonials (using Swiper)
export function TestimonialCarousel({
  testimonials,
  title,
  subtitle,
}: {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATIONS.base }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={cn(
              "text-4xl sm:text-5xl font-bold mb-4",
              "bg-gradient-to-r from-secondary-500 to-accent-500 bg-clip-text text-transparent"
            )}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-text-secondary">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* Simple rotation carousel effect */}
        <div className="flex flex-col gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: DURATIONS.base,
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

