"use client";

import { RefObject, useEffect, useRef, useState } from "react";

/**
 * Hook para obtener dimensiones de un elemento
 * Útil para responsive animations
 */
export function useElementDimensions<T extends HTMLElement>(
  ref: RefObject<T>
) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight
        });
      }
    };

    if (ref.current) {
      handleResize();
    }

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [ref]);

  return dimensions;
}

/**
 * Hook para medir elemento usando ResizeObserver
 */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0, top: 0, left: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // ResizeObserver para cambios de tamaño
    const resizeObserver = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      setBounds({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      });
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  return [ref, bounds] as const;
}
