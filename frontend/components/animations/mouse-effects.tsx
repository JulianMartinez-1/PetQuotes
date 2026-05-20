"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Mouse tracking glow effect
 * Creates a glow that follows the mouse cursor
 */
export function MouseTrackingGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none -z-50"
      style={{
        background:
          "radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, transparent 70%)",
        filter: "blur(40px)",
      }}
      animate={{
        x: isVisible ? mousePosition.x - 150 : mousePosition.x,
        y: isVisible ? mousePosition.y - 150 : mousePosition.y,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 200,
        mass: 1,
      }}
    />
  );
}

/**
 * Interactive button with mouse tracking effect
 */
export function MouseTrackingButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: ref.current?.offsetWidth ?? 0 / 2, y: ref.current?.offsetHeight ?? 0 / 2 });
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow effect follows mouse */}
      <motion.div
        className="absolute w-20 h-20 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 255, 255, 0.3), transparent 70%)",
          filter: "blur(20px)",
          left: position.x - 40,
          top: position.y - 40,
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {children}
    </motion.div>
  );
}

/**
 * Hover reveal effect on images/elements
 * Reveals a glow effect on hover
 */
export function HoverReveal({
  children,
  glowColor = "secondary",
  glowIntensity = 0.3,
}: {
  children: React.ReactNode;
  glowColor?: "secondary" | "accent" | "success" | "warning";
  glowIntensity?: number;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const colorMap = {
    secondary: `rgba(6, 182, 212, ${glowIntensity})`,
    accent: `rgba(251, 113, 133, ${glowIntensity})`,
    success: `rgba(16, 185, 129, ${glowIntensity})`,
    warning: `rgba(245, 158, 11, ${glowIntensity})`,
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x: x - 50, y: y - 50 });
  };

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Reveal glow */}
      <motion.div
        className="absolute w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colorMap[glowColor]}, transparent)`,
          filter: "blur(30px)",
          left: position.x,
          top: position.y,
        }}
        animate={{
          opacity: isHovering ? 1 : 0,
          scale: isHovering ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        animate={{
          boxShadow: isHovering
            ? `0 0 30px ${colorMap[glowColor]}`
            : `0 0 0px rgba(0,0,0,0)`,
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Cursor dot effect
 * Animated dot that follows cursor
 */
export function CursorDot() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border-2 border-secondary rounded-full pointer-events-none -z-40"
        animate={{
          x: isVisible ? mousePosition.x - 16 : mousePosition.x,
          y: isVisible ? mousePosition.y - 16 : mousePosition.y,
          opacity: isVisible ? 0.5 : 0,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 200,
        }}
      />

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-secondary rounded-full pointer-events-none -z-40"
        animate={{
          x: isVisible ? mousePosition.x - 4 : mousePosition.x,
          y: isVisible ? mousePosition.y - 4 : mousePosition.y,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
      />
    </>
  );
}

/**
 * Text cursor tracking effect
 * Text glows as cursor approaches
 */
export function TextCursorGlow({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`relative inline-block ${className}`}
    >
      {text.split("").map((char, idx) => {
        const charX = (idx * 10) + 50; // Approximate x position of character
        const distance = Math.sqrt(
          Math.pow(mousePosition.x - charX, 2) +
            Math.pow(mousePosition.y - 20, 2)
        );

        const opacity = Math.max(0, 1 - distance / 150);

        return (
          <motion.span
            key={idx}
            className="inline-block"
            animate={{
              color: opacity > 0.5 ? "rgba(0, 255, 255, 1)" : "rgba(230, 230, 230, 1)",
              textShadow:
                opacity > 0.5
                  ? `0 0 ${20 * opacity}px rgba(0, 255, 255, ${opacity})`
                  : "none",
            }}
            transition={{ duration: 0.2 }}
          >
            {char}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

