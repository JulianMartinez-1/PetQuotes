/**
 * Bundle analysis configuration and utilities
 * Identifies opportunities for optimization
 */

export interface BundleAnalysis {
  totalSize: number;
  mainBundle: number;
  chunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  largeModules: Array<{
    name: string;
    size: number;
  }>;
}

/**
 * Analyze bundle size and identify bottlenecks
 * Run: npm run analyze
 */
export const BUNDLE_ANALYSIS_CONFIG = {
  enabled: process.env.ANALYZE === "true",
  outputPath: ".next/analysis",
  statsOptions: {
    all: true,
    modules: true,
    modulesSort: "size",
  },
};

/**
 * Module size thresholds (in KB)
 * Warn if exceeded
 */
export const SIZE_THRESHOLDS = {
  page: 50, // Individual page size
  chunk: 100, // Code split chunk size
  bundle: 150, // Main bundle size
  vendor: 200, // Vendor bundle (node_modules)
};

/**
 * Optimization opportunities
 */
export const OPTIMIZATION_OPPORTUNITIES = {
  "framer-motion": {
    size: "~40kb",
    recommendation: "Already optimized with tree-shaking",
    status: "✓ Good",
  },
  gsap: {
    size: "~30kb",
    recommendation: "Use only ScrollTrigger plugin when needed",
    status: "⚠ Monitor",
  },
  recharts: {
    size: "~70kb",
    recommendation: "Lazy load charts with dynamic import",
    status: "⚠ Needs optimization",
  },
  "react-query": {
    size: "~35kb",
    recommendation: "Already optimized",
    status: "✓ Good",
  },
  tailwind: {
    size: "~20kb (gzipped)",
    recommendation: "Tree-shake unused utilities",
    status: "✓ Good",
  },
};

/**
 * Recommended code splitting points
 */
export const CODE_SPLITTING_POINTS = [
  {
    route: "/bookings",
    reason: "Heavy form with date picker and time slots",
    expectedSavings: "15-20kb",
  },
  {
    route: "/clinics",
    reason: "Map component and filters",
    expectedSavings: "20-30kb",
  },
  {
    route: "/profile",
    reason: "Settings and notifications",
    expectedSavings: "10-15kb",
  },
  {
    component: "TestimonialCarousel",
    reason: "Heavy animation component",
    expectedSavings: "8-12kb",
  },
];

/**
 * Generate bundle analysis report
 */
export function generateBundleReport(metrics: any): string {
  return `
╔════════════════════════════════════════╗
║       BUNDLE ANALYSIS REPORT           ║
╚════════════════════════════════════════╝

📦 Total Bundle Size: ${(metrics.totalSize / 1024).toFixed(2)} KB

📄 Page Sizes:
${metrics.pageBreakdown.map((p: any) => `  • ${p.name}: ${(p.size / 1024).toFixed(2)} KB`).join("\n")}

🔧 Optimization Suggestions:
${CODE_SPLITTING_POINTS.map((p) => `  • ${p.route || p.component}: ${p.expectedSavings}`).join("\n")}

⚡ Current Status: ${metrics.optimized ? "✓ OPTIMIZED" : "⚠ NEEDS WORK"}
  `;
}

/**
 * Performance budget
 * Warns if exceeded
 */
export const PERFORMANCE_BUDGET = {
  javascript: {
    total: 200, // KB
    pages: {
      home: 160,
      login: 130,
      register: 130,
      bookings: 170,
      profile: 170,
      clinics: 180,
    },
  },
  css: {
    total: 50, // KB
  },
  images: {
    totalOptimized: 500, // KB for all images combined
    largestImage: 100, // KB for single image
  },
  fonts: {
    total: 60, // KB
  },
};
