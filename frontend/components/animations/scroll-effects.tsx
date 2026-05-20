"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

/**
 * Scroll-triggered reveal animation component
 * Elements fade in and slide up when they come into view
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Parallax scroll component
 * Creates depth effect with offset based on scroll position
 */
export function ParallaxScroll({
  children,
  offset = 50,
  className = "",
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Staggered scroll animation container
 * Animates children in sequence on scroll
 */
export function ScrollStaggerContainer({
  children,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  staggerDelay?: number;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  );
}

/**
 * Scroll-triggered color change animation
 * Changes color as element scrolls into view
 */
export function ScrollColorReveal({
  children,
  fromColor = "from-surface",
  toColor = "from-secondary",
}: {
  children: ReactNode;
  fromColor?: string;
  toColor?: string;
}) {
  return (
    <motion.div
      initial={{ backgroundImage: `linear-gradient(to right, var(--surface))` }}
      whileInView={{
        backgroundImage: `linear-gradient(to right, var(--secondary), var(--accent))`,
      }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-triggered text animation
 * Text letters animate in sequence as element enters viewport
 */
export function ScrollTextReveal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: custom * 0.1,
      },
    }),
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: "easeOut", duration: 0.6 },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={0}
    >
      {text.split("").map((letter, idx) => (
        <motion.span key={idx} variants={letterVariants}>
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

/**
 * Scroll-triggered scale animation
 * Elements scale up smoothly when entering viewport
 */
export function ScrollScale({
  children,
  from = 0.8,
  to = 1,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
}) {
  return (
    <motion.div
      initial={{ scale: from, opacity: 0 }}
      whileInView={{ scale: to, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-triggered rotate animation
 * Elements rotate smoothly when entering viewport
 */
export function ScrollRotate({
  children,
  from = -10,
  to = 0,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
}) {
  return (
    <motion.div
      initial={{ rotate: from, opacity: 0 }}
      whileInView={{ rotate: to, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-triggered slide animation (directional)
 */
export function ScrollSlide({
  children,
  direction = "up",
  distance = 50,
}: {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}) {
  const initialValues: Record<string, Record<string, number>> = {
    up: { y: distance, opacity: 0 },
    down: { y: -distance, opacity: 0 },
    left: { x: distance, opacity: 0 },
    right: { x: -distance, opacity: 0 },
  };

  const initial = initialValues[direction] || { y: distance, opacity: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-triggered blur effect reveal
 * Element becomes sharp as it scrolls into view (blur to clear)
 */
export function ScrollBlurReveal({
  children,
  fromBlur = 10,
}: {
  children: ReactNode;
  fromBlur?: number;
}) {
  return (
    <motion.div
      initial={{ filter: `blur(${fromBlur}px)`, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Floating animation component
 * Continuous gentle floating motion
 */
export function FloatingAnimation({
  children,
  duration = 3,
  amount = 20,
}: {
  children: ReactNode;
  duration?: number;
  amount?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -amount, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pulse glow animation component
 * Continuous pulsing glow effect
 */
export function PulseGlow({
  children,
  color = "secondary",
}: {
  children: ReactNode;
  color?: "secondary" | "accent" | "success" | "warning";
}) {
  const colorMap = {
    secondary: "rgba(0, 255, 255, 0.3)",
    accent: "rgba(255, 0, 255, 0.3)",
    success: "rgba(34, 197, 94, 0.3)",
    warning: "rgba(234, 179, 8, 0.3)",
  };

  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${colorMap[color]}`,
          `0 0 40px ${colorMap[color]}`,
          `0 0 20px ${colorMap[color]}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

