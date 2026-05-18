/**
 * Performance metrics collection and reporting
 * Track Core Web Vitals: LCP, FCP, CLS, TTFB
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fid?: number; // First Input Delay (deprecated, replaced by INP)
  inp?: number; // Interaction to Next Paint
  navigation?: number; // Navigation timing
}

const metrics: PerformanceMetrics = {};

/**
 * Initialize Web Vitals monitoring
 */
export function initializeWebVitals() {
  if (typeof window === "undefined") return;

  // First Contentful Paint (FCP)
  if ("PerformanceObserver" in window) {
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[0];
        metrics.fcp = fcp.startTime;
        console.log("📊 FCP:", metrics.fcp.toFixed(2), "ms");
      });
      fcpObserver.observe({ entryTypes: ["paint"] });
    } catch (e) {
      // Silently fail if not supported
    }
  }

  // Largest Contentful Paint (LCP)
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        metrics.lcp = lcp.startTime;
        console.log("📊 LCP:", metrics.lcp.toFixed(2), "ms");
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // Silently fail
    }
  }

  // Cumulative Layout Shift (CLS)
  if ("PerformanceObserver" in window) {
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach((entry) => {
          if (!("hadRecentInput" in entry) || !entry.hadRecentInput) {
            const firstSessionEntry =
              clsValue === 0 ? entry.startTime : entries[0].startTime;
            if (entry.startTime - firstSessionEntry < 1000) {
              clsValue += (entry as any).value;
            }
          }
        });
        metrics.cls = clsValue;
        console.log("📊 CLS:", metrics.cls.toFixed(4));
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      // Silently fail
    }
  }

  // Time to First Byte (TTFB)
  if ("performance" in window) {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.fetchStart;
      console.log("📊 TTFB:", metrics.ttfb.toFixed(2), "ms");
    }
  }

  // Log after a delay to ensure all metrics are collected
  setTimeout(() => {
    console.log("📊 All Core Web Vitals:", metrics);
  }, 3000);
}

/**
 * Get current metrics
 */
export function getMetrics(): PerformanceMetrics {
  return metrics;
}

/**
 * Report metrics to analytics service
 */
export function reportMetrics(endpoint: string = "/api/analytics/metrics") {
  const data = getMetrics();

  if (Object.keys(data).length === 0) return;

  // Use sendBeacon for reliability
  if ("sendBeacon" in navigator) {
    navigator.sendBeacon(endpoint, JSON.stringify(data));
  } else {
    // Fallback to fetch
    fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Check if metrics meet target thresholds
 * Target: LCP < 2.5s, FCP < 1.8s, CLS < 0.1, TTFB < 600ms
 */
export function checkMetricThresholds(): {
  lcp: boolean;
  fcp: boolean;
  cls: boolean;
  ttfb: boolean;
  overall: boolean;
} {
  return {
    lcp: (metrics.lcp ?? Infinity) < 2500,
    fcp: (metrics.fcp ?? Infinity) < 1800,
    cls: (metrics.cls ?? Infinity) < 0.1,
    ttfb: (metrics.ttfb ?? Infinity) < 600,
    overall:
      (metrics.lcp ?? Infinity) < 2500 &&
      (metrics.fcp ?? Infinity) < 1800 &&
      (metrics.cls ?? Infinity) < 0.1 &&
      (metrics.ttfb ?? Infinity) < 600,
  };
}

/**
 * Format metrics for display
 */
export function formatMetrics(): string {
  const threshold = checkMetricThresholds();
  return `
    LCP: ${metrics.lcp?.toFixed(2) ?? "N/A"} ms ${threshold.lcp ? "✓" : "✗"}
    FCP: ${metrics.fcp?.toFixed(2) ?? "N/A"} ms ${threshold.fcp ? "✓" : "✗"}
    CLS: ${metrics.cls?.toFixed(4) ?? "N/A"} ${threshold.cls ? "✓" : "✗"}
    TTFB: ${metrics.ttfb?.toFixed(2) ?? "N/A"} ms ${threshold.ttfb ? "✓" : "✗"}
    Overall: ${threshold.overall ? "✓ GOOD" : "✗ NEEDS IMPROVEMENT"}
  `;
}
