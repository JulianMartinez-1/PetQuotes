import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}"
  ],
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
        },
        // Secondary - secondary brillante
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
        },
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
        },
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
        },
        // Background & Surface
        background: "#F1F5F9",
        surface: "#FFFFFF",
        foreground: "#0F172A",
      },
    }
  },
  plugins: []
};

export default config;

