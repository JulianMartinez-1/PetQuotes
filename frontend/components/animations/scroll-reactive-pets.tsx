"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dog, Cat, Bird } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollReactivePetsProps {
  className?: string;
  position?: "left" | "right";
  offset?: number;
}

export function ScrollReactivePets({
  className,
  position = "right",
  offset = 0,
}: ScrollReactivePetsProps) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // Calculate pet positions based on scroll
  const pet1Y = scrollY * 0.3; // Slower parallax
  const pet2Y = scrollY * 0.5;
  const pet3Y = scrollY * 0.2;

  const petClasses = position === "left" ? "left-8" : "right-8";

  return (
    <div
      ref={containerRef}
      className={cn("fixed top-1/3 pointer-events-none", petClasses, className)}
    >
      {/* Dog */}
      <motion.div
        className="absolute text-5xl"
        style={{
          y: pet1Y,
          opacity: isVisible ? 0.4 : 0.2,
        }}
        animate={{
          rotate: [0, 5, -5, 0],
          x: position === "left" ? [0, 10, -10, 0] : [0, -10, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Dog className="w-16 h-16 text-orange/40 drop-shadow-lg" />
      </motion.div>

      {/* Cat */}
      <motion.div
        className="absolute text-5xl top-32"
        style={{
          y: pet2Y,
          opacity: isVisible ? 0.5 : 0.25,
        }}
        animate={{
          rotate: [0, -8, 8, 0],
          x: position === "left" ? [0, -15, 15, 0] : [0, 15, -15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Cat className="w-20 h-20 text-green/40 drop-shadow-lg" />
      </motion.div>

      {/* Bird */}
      <motion.div
        className="absolute text-5xl top-64"
        style={{
          y: pet3Y,
          opacity: isVisible ? 0.3 : 0.15,
        }}
        animate={{
          rotate: [0, 10, -10, 0],
          y: [0, -20, 0, 20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Bird className="w-14 h-14 text-teal/40 drop-shadow-lg" />
      </motion.div>
    </div>
  );
}

export function FloatingPetsSection({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("relative py-24", className)}>
      <ScrollReactivePets position="left" offset={0} />
      <ScrollReactivePets position="right" offset={100} />

      {/* Content goes here */}
    </div>
  );
}
