import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0A2540",
        brand: "#2563EB",
        sky: "#E8F1FF",
        soft: "#6B7280"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(10,37,64,0.12)"
      }
    }
  },
  plugins: []
};

export default config;
