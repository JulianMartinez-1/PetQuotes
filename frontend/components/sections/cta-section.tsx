"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DURATIONS } from "@/constants/animations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAProps {
  title: string;
  subtitle?: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  variant?: "default" | "gradient" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CTA({
  title,
  subtitle,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  variant = "default",
  size = "md",
  className,
}: CTAProps) {
  const sizeMap = {
    sm: {
      containerPadding: "py-12 px-6",
      titleSize: "text-2xl sm:text-3xl",
      subtitleSize: "text-base",
    },
    md: {
      containerPadding: "py-20 px-8",
      titleSize: "text-3xl sm:text-4xl",
      subtitleSize: "text-lg",
    },
    lg: {
      containerPadding: "py-24 px-8",
      titleSize: "text-4xl sm:text-5xl",
      subtitleSize: "text-xl",
    },
  };

  const currentSize = sizeMap[size];

  const variants = {
    default: "bg-surface border border-border/30",
    gradient: cn(
      "bg-gradient-to-r from-secondary/10 via-transparent to-accent/10",
      "border border-gradient-to-r from-secondary/30 to-accent/30"
    ),
    minimal: "bg-transparent border-b-2 border-secondary/30 hover:border-secondary/60",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: false, amount: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        currentSize.containerPadding,
        variants[variant],
        "transition-all duration-300",
        className
      )}
    >
      {/* Background Elements */}
      {variant === "gradient" && (
        <motion.div
          className="absolute inset-0 -z-10 opacity-20"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-transparent to-accent blur-3xl" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.h2
          className={cn(
            "font-black mb-4 text-text-primary",
            currentSize.titleSize,
            "text-5xl sm:text-6xl"
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
            className={cn(
              "text-text-primary font-semibold mb-8 max-w-2xl",
              currentSize.subtitleSize
            )}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false }}
        >
          <Link href={primaryHref as any}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="primary"
                size="lg"
                className="gap-2 group !text-black"
              >
                {primaryText}
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </Button>
            </motion.div>
          </Link>

          {secondaryText && secondaryHref && (
            <Link href={secondaryHref as any}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                >
                  {secondaryText}
                </Button>
              </motion.div>
            </Link>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}

// Inline CTA (smaller, for use within pages)
export function InlineCTA({
  title,
  text,
  href,
  icon: Icon,
}: {
  title: string;
  text: string;
  href: string;
  icon?: any;
}) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl p-6",
        "bg-gradient-to-r from-secondary/5 to-accent/5",
        "border border-secondary/20 hover:border-secondary/50",
        "transition-all duration-300"
      )}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.base }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
          <p className="text-sm text-text-secondary">{text}</p>
        </div>
        <Link href={href as any}>
          <motion.button
            className={cn(
              "flex-shrink-0 p-3 rounded-lg",
              "bg-secondary/10 text-secondary border border-secondary/30",
              "hover:bg-secondary/20 hover:border-secondary/50",
              "transition-all duration-300"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {Icon ? <Icon size={20} /> : <ArrowRight size={20} />}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

