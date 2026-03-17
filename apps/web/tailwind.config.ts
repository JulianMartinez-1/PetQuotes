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
        navy: "#0B2239",
        brand: "#118AB2",
        sky: "#DFF4FF",
        soft: "#5C6D82",
        accent: "#FFD166",
        line: "#D4DEEA"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(11, 34, 57, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
