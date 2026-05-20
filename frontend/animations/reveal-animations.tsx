"use client";

import { motion, Variants } from "framer-motion";
import { PropsWithChildren } from "react";
import { containerVariants, itemVariants, slideUpVariants } from "@/constants/animations";

type AnimationProps = PropsWithChildren<{
  delay?: number;
  duration?: number;
}>;

/**
 * Reveal Text - Texto que aparece con animación
 */
export function RevealText({ children, delay = 0, duration = 0.5 }: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Fade In - Fade de entrada simple
 */
export function FadeIn({ children, delay = 0, duration = 0.6 }: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide Up - Desliza hacia arriba
 */
export function SlideUp({ children, delay = 0 }: Omit<AnimationProps, "duration">) {
  return (
    <motion.div
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Container - Contenedor para animar múltiples items
 */
export function StaggerContainer({ children }: PropsWithChildren) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Item - Item dentro de StaggerContainer
 */
export function StaggerItem({ children }: PropsWithChildren) {
  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Scale In - Escala de entrada
 */
export function ScaleIn({ children, delay = 0 }: Omit<AnimationProps, "duration">) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Glow Effect - Efecto de brillo con Framer Motion
 */
export function GlowEffect({ children }: PropsWithChildren) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 20px rgba(255, 255, 255, 0.2)",
          "0 0 40px rgba(255, 255, 255, 0.4)",
          "0 0 20px rgba(255, 255, 255, 0.2)"
        ]
      }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}
