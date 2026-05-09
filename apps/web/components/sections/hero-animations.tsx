"use client";

import { useEffect, useRef } from "react";

export function HeroSection({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: { text: string; href: string };
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attempt to load GSAP animations, but don't fail if they don't load
    const loadAnimations = async () => {
      try {
        const gsapModule = await import("gsap");
        if (!gsapModule || !gsapModule.default) return;
        
        const gsap = gsapModule.default;
        const scrollTriggerModule = await import("gsap/ScrollTrigger");
        const { ScrollTrigger } = scrollTriggerModule;
        
        if (!ScrollTrigger) return;
        
        if (!gsap.plugins.ScrollTrigger) {
          gsap.registerPlugin(ScrollTrigger);
        }

        if (!heroRef.current) return;

        // Animate background
        if (bgRef.current) {
          gsap.fromTo(
            bgRef.current,
            { opacity: 0, scale: 1.1 },
            { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
          );
        }

        // Animate title
        if (titleRef.current) {
          gsap.fromTo(
            titleRef.current,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              delay: 0.2,
            }
          );
        }

        // Animate subtitle
        if (subtitleRef.current) {
          gsap.fromTo(
            subtitleRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              delay: 0.4,
            }
          );
        }

        // Animate CTA button
        if (ctaRef.current) {
          gsap.fromTo(
            ctaRef.current,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: "back.out",
              delay: 0.6,
            }
          );
        }

        // Parallax effect on scroll
        if (titleRef.current && heroRef.current) {
          gsap.to(titleRef.current, {
            y: -80,
            opacity: 0.5,
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "center center",
              scrub: 1,
              markers: false,
            },
          });
        }
      } catch (error) {
        // Silently fail - animations will be skipped but page will still render
        console.warn("GSAP animations could not be loaded:", error);
      }
    };

    loadAnimations();

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    >
      {/* Animated background elements */}
      <div
        ref={bgRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
        >
          {title}
        </h1>
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </p>
        <div ref={ctaRef} className="flex gap-4 justify-center flex-wrap">
          <a
            href={cta.href}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {cta.text}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-600">Scroll para más</p>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gray-600 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionDivider() {
  const dividerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent my-16">
      <div
        ref={dividerRef}
        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
      ></div>
    </div>
  );
}

export function RevealText({ children }: { children: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);

  return (
    <p
      ref={textRef}
      className="text-lg text-gray-600 text-center max-w-2xl mx-auto"
    >
      {children}
    </p>
  );
}
