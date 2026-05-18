"use client";

import { useEffect } from "react";
import Image from "next/image";

export function SmoothScroller() {
  useEffect(() => {
    // Scroll al tope cuando la página se recarga
    window.scrollTo(0, 0);
  }, []);

  return null;
}

export function ScrollIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 origin-left z-50" />
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  offset?: number;
  className?: string;
  width?: number;
  height?: number;
}

export function ParallaxImage({
  src,
  alt,
  offset = 50,
  className = "",
  width = 1000,
  height = 600,
}: ParallaxImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}

export function FloatingElement({
  children,
  duration = 3,
  distance = 20,
  className = "",
}: FloatingElementProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
