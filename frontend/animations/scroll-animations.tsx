"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, PropsWithChildren } from "react";

/**
 * Parallax Component - Efecto parallax en scroll
 */
export function Parallax({ children, offset = 50 }: PropsWithChildren<{ offset?: number }>) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}

/**
 * Parallax Background - Fondo que se mueve más lentamente
 */
export function ParallaxBg({ 
  children, 
  speed = 0.5 
}: PropsWithChildren<{ speed?: number }>) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (value) => value * speed);

  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  );
}

/**
 * Scroll Trigger Animation - Anima cuando entra en viewport
 */
export function ScrollReveal({ children }: PropsWithChildren) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "center 0.2"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [40, 20, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}
