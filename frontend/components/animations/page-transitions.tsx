"use client";

import React, { useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import clsx from "clsx";

/**
 * Page transition wrapper for smooth navigation
 * Wraps entire page content to create smooth entrance/exit animations
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10,
      filter: "blur(5px)",
    },
    enter: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      filter: "blur(5px)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Loading state overlay animation
 * Shows during page transitions
 */
export function PageLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 pointer-events-none"
    >
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-cyan border-r-magenta" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Staggered background elements animation
 * Creates visual depth with animated background shapes
 */
export function AnimatedBackground() {
  const shapes = Array.from({ length: 3 });
  const bgColors = ["bg-cyan/20", "bg-magenta/15", "bg-cyan/10"];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {shapes.map((_, idx) => (
        <motion.div
          key={idx}
          className={clsx("absolute rounded-full blur-3xl", bgColors[idx])}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + idx * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: `${200 + idx * 100}px`,
            height: `${200 + idx * 100}px`,
            top: `${-50 + idx * 30}%`,
            left: `${-20 + idx * 40}%`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Scroll progress bar animation
 * Shows reading progress as user scrolls down page
 */
export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan to-magenta z-50"
      style={{ width: `${scrollProgress}%` }}
      transition={{ duration: 0.1 }}
    />
  );
}

/**
 * Component reveal with line animation
 * Horizontal line reveals then component animates in
 */
export function RevealWithLine({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div>
      {/* Line animation */}
      <motion.div
        className="h-1 bg-gradient-to-r from-cyan/0 via-cyan to-cyan/0 mb-4"
        initial={{ scaleX: 0, transformOrigin: "left" }}
        whileInView={{ scaleX: 1 }}
        transition={{
          duration: 0.8,
          delay,
          ease: "easeOut",
        }}
        viewport={{ once: true }}
      />
      
      {/* Content animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: delay + 0.2,
          ease: "easeOut",
        }}
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
