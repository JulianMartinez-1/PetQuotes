"use client";

import { useEffect } from "react";
import { initializeWebVitals, reportMetrics } from "@/lib/performance-metrics";

/**
 * Client-side component to initialize Web Vitals monitoring
 */
export function WebVitalsScript() {
  useEffect(() => {
    // Initialize metrics collection
    initializeWebVitals();

    // Report metrics when page unloads
    const handleBeforeUnload = () => {
      reportMetrics();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return null;
}
