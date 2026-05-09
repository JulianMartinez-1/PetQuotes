import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar el plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  trigger?: string | HTMLElement;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string | HTMLElement;
  markers?: boolean;
}

export function useScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook para animar elementos al scroll
  const animateOnScroll = (
    element: HTMLElement | null,
    animation: gsap.core.Timeline | gsap.TweenVars,
    options: ScrollAnimationOptions = {}
  ) => {
    if (!element) return;

    const defaults = {
      trigger: element,
      start: "top center",
      end: "center center",
      scrub: 1,
      ...options,
    };

    if (animation instanceof gsap.core.Timeline) {
      gsap.to(animation, { scrollTrigger: defaults });
    } else {
      gsap.to(element, { ...animation, scrollTrigger: defaults });
    }
  };

  // Hook para parallax effect
  const parallaxEffect = (element: HTMLElement | null, speed: number = 0.5) => {
    if (!element) return;

    gsap.to(element, {
      y: `${speed * 100}px`,
      scrollTrigger: {
        trigger: element,
        start: "top center",
        end: "center center",
        scrub: 1,
        markers: false,
      },
    });
  };

  // Hook para fade in effect
  const fadeInOnScroll = (element: HTMLElement | null, delay: number = 0) => {
    if (!element) return;

    gsap.fromTo(
      element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: delay,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "center center",
          scrub: false,
          markers: false,
        },
      }
    );
  };

  // Hook para stagger animation
  const staggerAnimation = (
    elements: HTMLElement[] | null,
    animation: gsap.TweenVars,
    staggerDelay: number = 0.1
  ) => {
    if (!elements || elements.length === 0) return;

    gsap.to(elements, {
      ...animation,
      stagger: staggerDelay,
      scrollTrigger: {
        trigger: elements[0],
        start: "top 80%",
        end: "center center",
        scrub: false,
        markers: false,
      },
    });
  };

  // Hook para counter animation
  const counterAnimation = (
    element: HTMLElement | null,
    endValue: number,
    duration: number = 2
  ) => {
    if (!element) return;

    gsap.to(
      { value: 0 },
      {
        value: endValue,
        duration: duration,
        onUpdate() {
          element.textContent = Math.floor(this.targets()[0].value).toLocaleString();
        },
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "center center",
          scrub: false,
          markers: false,
        },
      }
    );
  };

  // Hook para pin animation
  const pinElement = (element: HTMLElement | null, duration: number = 3) => {
    if (!element) return;

    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        pin: true,
        pinSpacing: true,
        start: "top top",
        end: `+=${duration * 100}%`,
        markers: false,
      },
    });
  };

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return {
    containerRef,
    animateOnScroll,
    parallaxEffect,
    fadeInOnScroll,
    staggerAnimation,
    counterAnimation,
    pinElement,
  };
}
