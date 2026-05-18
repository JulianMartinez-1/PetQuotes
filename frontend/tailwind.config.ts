import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        // Neutrals - Petshop Amigable
        black: "#1F1F1F",
        dark: "#3D3D3D",
        "dark-lighter": "#5A5A5A",
        surface: "#F5E6D3",
        "surface-light": "#FDF8F3",
        
        // Text
        text: {
          primary: "#2D2D2D",
          secondary: "#666666",
          tertiary: "#999999",
          muted: "#CCCCCC"
        },
        
        // Brand Colors - Petshop Playful
        orange: "#FF9500",
        "orange-dark": "#E67E00",
        green: "#22C55E",
        "green-dark": "#16A34A",
        teal: "#06B6D4",
        "teal-dark": "#0891B2",
        
        // Semantic
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        
        // Legacy (compatibilidad con código existente)
        navy: "#2D3E4F",
        brand: "#FF9500",
        sky: "#E0F2FE",
        soft: "#D4D4D4",
        accent: "#22C55E",
        line: "#E5E5E5"
      },
      
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"],
        display: ["Poppins", "ui-sans-serif"]
      },
      
      fontSize: {
        // Display
        "display-xl": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-lg": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-md": ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-sm": ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
      },
      
      boxShadow: {
        soft: "0 18px 45px rgba(31, 31, 31, 0.08)",
        // Warm shadows for petshop
        "glow-sm": "0 0 8px rgba(255, 149, 0, 0.15)",
        "glow-md": "0 0 16px rgba(255, 149, 0, 0.25)",
        "glow-lg": "0 0 32px rgba(255, 149, 0, 0.35)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.3)",
        "elevation-sm": "0 4px 6px rgba(0, 0, 0, 0.08)",
        "elevation-md": "0 12px 24px rgba(0, 0, 0, 0.12)",
        "elevation-lg": "0 24px 48px rgba(0, 0, 0, 0.15)"
      },
      
      backgroundImage: {
        // Gradients petshop amigables
        "gradient-hero": "linear-gradient(135deg, #F5E6D3 0%, #FDF8F3 50%, #FFF9F0 100%)",
        "gradient-accent": "linear-gradient(135deg, #FF9500 0%, #22C55E 100%)",
        "gradient-warm": "linear-gradient(135deg, #FF9500 0%, #F59E0B 100%)",
        "gradient-nature": "linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(245, 230, 211, 0.9) 0%, rgba(253, 248, 243, 0.9) 100%)",
      },
      
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px"
      },
      
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.6s ease-out",
        "scale-in": "scaleIn 0.6s ease-out",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "float": "float 6s ease-in-out infinite",
        "wiggle": "wiggle 0.6s ease-in-out",
        "pet-trot": "petTrot 1.2s ease-in-out infinite",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        bounceGentle: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 15px rgba(255, 149, 0, 0.2)" },
          "50%": { opacity: "0.9", boxShadow: "0 0 30px rgba(255, 149, 0, 0.4)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-2deg)" },
          "75%": { transform: "rotate(2deg)" }
        },
        petTrot: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "25%": { transform: "translateX(5px) translateY(-3px)" },
          "50%": { transform: "translateX(10px) translateY(0)" },
          "75%": { transform: "translateX(15px) translateY(-3px)" }
        }
      },
      
      transitionDuration: {
        fast: "150ms",
        base: "300ms",
        slow: "500ms",
        slower: "700ms"
      },
      
      spacing: {
        safe: "max(1rem, env(safe-area-inset-left))",
      }
    }
  },
  plugins: []
};

export default config;
