import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ScrollReveal,
  ParallaxScroll,
  ScrollScale,
  ScrollSlide,
  ScrollTextReveal,
} from "@/components/animations/scroll-effects";
import { RevealWithLine } from "@/components/animations/page-transitions";
import { cn } from "@/lib/utils";

/**
 * Enhanced section header with scroll animations
 */
export function EnhancedSectionHeader({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center mb-16", className)}>
      {/* Line reveal animation */}
      <RevealWithLine delay={0}>
        <motion.h2
          className={cn(
            "text-4xl sm:text-5xl lg:text-6xl font-bold mb-4",
            "bg-gradient-to-r from-cyan via-text-primary to-magenta",
            "bg-clip-text text-transparent"
          )}
        >
          {title}
        </motion.h2>
      </RevealWithLine>

      {subtitle && (
        <ScrollReveal delay={0.2}>
          <p className="text-xl text-text-secondary mt-4 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}

/**
 * Enhanced feature card with scroll animations
 */
export function EnhancedFeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}) {
  return (
    <ScrollSlide direction="up" distance={40}>
      <motion.div
        className={cn(
          "relative p-8 rounded-xl border-2 border-surface-light/30",
          "bg-surface/50 backdrop-blur-lg hover:border-cyan/50",
          "transition-all duration-300 hover:bg-surface/80",
          "hover:shadow-lg hover:shadow-cyan/20",
          className
        )}
        whileHover={{ y: -8, borderColor: "rgba(0, 255, 255, 0.7)" }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="w-8 h-8 text-cyan" />
        </motion.div>

        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary">{description}</p>

        {/* Accent line */}
        <motion.div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan to-transparent rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />
      </motion.div>
    </ScrollSlide>
  );
}

/**
 * Enhanced stats card with counter animation
 */
export function EnhancedStatCard({
  value,
  label,
  delay = 0,
  className = "",
}: {
  value: string;
  label: string;
  delay?: number;
  className?: string;
}) {
  return (
    <ScrollScale from={0.8} to={1}>
      <motion.div
        className={cn(
          "relative p-8 rounded-xl border-2 border-cyan/30",
          "bg-gradient-to-br from-cyan/10 to-magenta/5",
          "backdrop-blur-lg text-center",
          className
        )}
        style={{
          backgroundImage:
            "radial-gradient(circle at top-right, rgba(0, 255, 255, 0.1), transparent)",
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-4xl sm:text-5xl font-bold text-cyan mb-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.6 }}
          viewport={{ once: true }}
        >
          {value}
        </motion.div>

        <p className="text-text-secondary text-lg">{label}</p>

        {/* Bottom accent */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-magenta to-cyan rounded-full"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        />
      </motion.div>
    </ScrollScale>
  );
}

/**
 * Enhanced testimonial card with scroll reveal
 */
export function EnhancedTestimonialCard({
  name,
  role,
  company,
  content,
  delay = 0,
  className = "",
}: {
  name: string;
  role: string;
  company: string;
  content: string;
  delay?: number;
  className?: string;
}) {
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        className={cn(
          "relative p-8 rounded-xl border-2 border-surface-light/30",
          "bg-surface/40 backdrop-blur-lg",
          className
        )}
        whileHover={{ borderColor: "rgba(0, 255, 255, 0.5)", y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Quote mark watermark */}
        <div className="absolute top-4 right-4 text-6xl text-cyan/10">&ldquo;</div>

        {/* Rating stars */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + i * 0.1 }}
              viewport={{ once: true }}
            >
              <span className="text-lg text-yellow-400">★</span>
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <p className="text-text-secondary mb-4 italic leading-relaxed">
          &ldquo;{content}&rdquo;
        </p>

        {/* Author */}
        <div className="border-t border-surface-light/20 pt-4">
          <p className="font-bold text-text-primary">{name}</p>
          <p className="text-sm text-text-secondary">{role}</p>
          <p className="text-xs text-cyan/60">{company}</p>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

/**
 * Enhanced CTA section with parallax background
 */
export function EnhancedCTASection({
  title,
  subtitle,
  buttonText,
  buttonHref,
  className = "",
}: {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  className?: string;
}) {
  return (
    <ParallaxScroll offset={50}>
      <section
        className={cn(
          "py-24 relative overflow-hidden rounded-2xl",
          "bg-gradient-to-r from-cyan/20 via-magenta/10 to-cyan/20",
          "border-2 border-cyan/30",
          className
        )}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1), transparent 50%)`,
            backgroundSize: "200% 200%",
          }}
        />

        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <ScrollReveal delay={0}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-text-primary">
              {title}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </ScrollReveal>

          <ScrollScale from={0.9} to={1}>
            <motion.a
              href={buttonHref}
              className={cn(
                "inline-flex items-center gap-2",
                "px-8 py-4 rounded-lg",
                "bg-cyan text-dark font-bold",
                "hover:bg-cyan/90 transition-all duration-300",
                "shadow-lg shadow-cyan/30"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {buttonText}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>
          </ScrollScale>
        </div>
      </section>
    </ParallaxScroll>
  );
}

/**
 * Enhanced grid container with staggered animations
 */
export function EnhancedGrid({
  children,
  columns = 3,
  className = "",
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <motion.div
      className={cn("grid gap-8", colsMap[columns], className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
