import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary - Azul oscuro profesional
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
          hover: "#2563EB",
        },
        "primary-hover": "#2563EB",
        // Secondary - Cyan brillante
        secondary: {
          50: "#ECFDFD",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
          950: "#0E3D54",
          hover: "#0891B2",
        },
        "secondary-hover": "#0891B2",
        // Mint - Verde menta
        mint: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBEF63",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#10B981",
          800: "#15803D",
          900: "#166534",
          950: "#0D3817",
          hover: "#059669",
        },
        "mint-hover": "#059669",
        // Accent - Coral
        accent: {
          50: "#FFF5F7",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA29B",
          400: "#F87171",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#FB7185",
          800: "#BE185D",
          900: "#9D174D",
          950: "#500724",
          hover: "#F43F5E",
        },
        "accent-hover": "#F43F5E",

        // ── Semantic tokens — dark-mode aware via CSS variables ──────────
        // body bg, page background
        background: "rgb(var(--tw-c-bg) / <alpha-value>)",
        // card / panel backgrounds
        "surface":       "rgb(var(--tw-c-surface) / <alpha-value>)",
        "surface-light": "rgb(var(--tw-c-surface-light) / <alpha-value>)",
        "surface-2":     "rgb(var(--tw-c-surface-2) / <alpha-value>)",
        // base text color (mirrors body color)
        foreground: "rgb(var(--tw-c-fg) / <alpha-value>)",
        // text hierarchy
        "text-primary":   "rgb(var(--tw-c-text-p) / <alpha-value>)",
        "text-secondary": "rgb(var(--tw-c-text-s) / <alpha-value>)",
        "text-tertiary":  "rgb(var(--tw-c-text-t) / <alpha-value>)",
        "text-muted":     "rgb(var(--tw-c-text-m) / <alpha-value>)",
        // borders
        "border":       "rgb(var(--tw-c-bdr) / <alpha-value>)",
        "border-light": "rgb(var(--tw-c-bdr-lt) / <alpha-value>)",
        "border-dark":  "rgb(var(--tw-c-bdr-dk) / <alpha-value>)",

        // Status colors (same in both modes)
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        "danger-dark": "#DC2626",

        // Explicit dark-mode overlay colors (not responsive — always dark)
        "dark-bg":       "#0F172A",
        "dark-surface":  "#1E293B",
        "dark-surface-2":"#334155",
      },
    }
  },
  plugins: []
};

export default config;
