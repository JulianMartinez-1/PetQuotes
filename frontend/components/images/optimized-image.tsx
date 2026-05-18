"use client";

import Image from "next/image";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "scale-down";
  objectPosition?: string;
  placeholder?: "blur" | "empty";
}

/**
 * Optimized image wrapper using Next.js Image
 * Provides automatic lazy loading, WebP support, and responsive sizing
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority = false,
  fill = false,
  objectFit = "cover",
  objectPosition = "center",
  placeholder = "blur",
}: OptimizedImageProps) {
  const baseStyle: CSSProperties = {
    objectFit,
    objectPosition,
    ...style,
  };

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("w-full h-full", className)}
        style={baseStyle}
        priority={priority}
        placeholder={placeholder}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
        quality={85}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      style={baseStyle}
      priority={priority}
      placeholder={placeholder}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
      quality={85}
    />
  );
}

/**
 * Hero image with parallax optimization
 */
export function HeroImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      objectFit="cover"
      className={cn("absolute inset-0", className)}
      placeholder="blur"
    />
  );
}

/**
 * Card image with fixed aspect ratio
 */
export function CardImage({
  src,
  alt,
  aspectRatio = "video",
  className = "",
}: {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "portrait" | number;
  className?: string;
}) {
  const ratioMap = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  const aspectClass =
    typeof aspectRatio === "number"
      ? `aspect-[${aspectRatio}]`
      : ratioMap[aspectRatio as keyof typeof ratioMap] || "aspect-video";

  return (
    <div className={cn("relative w-full", aspectClass, className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        placeholder="blur"
      />
    </div>
  );
}

/**
 * Avatar image - circular with fallback
 */
export function AvatarImage({
  src,
  alt,
  size = 48,
  className = "",
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative rounded-full overflow-hidden flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        objectFit="cover"
        placeholder="blur"
      />
    </div>
  );
}

/**
 * Background image container
 */
export function BackgroundImage({
  src,
  alt,
  children,
  className = "",
  overlay = false,
  overlayOpacity = 0.4,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        className="-z-10"
        placeholder="blur"
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-dark -z-10"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {children}
    </div>
  );
}

/**
 * Responsive image gallery item
 */
export function GalleryImage({
  src,
  alt,
  width = 300,
  height = 300,
  onClick,
  className = "",
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg cursor-pointer",
        "group hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        objectFit="cover"
        className="group-hover:scale-105 transition-transform duration-300"
        placeholder="blur"
      />
    </div>
  );
}
