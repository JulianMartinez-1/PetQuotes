/**
 * Paleta de colores Petshop Amigable
 * Colores cálidos, playful, amigables con mascotas
 * Tonos naranja, verde, turquesa y beige
 */

export const colors = {
  // Neutrals - Base cálida y amigable
  black: "#1F1F1F",
  dark: "#3D3D3D",
  darkLighter: "#5A5A5A",
  surface: "#F5E6D3",
  surfaceLight: "#FDF8F3",
  surface2: "#FAF2E8",

  // Text - Para legibilidad natural
  textPrimary: "#2D2D2D",
  textSecondary: "#666666",
  textTertiary: "#999999",
  textMuted: "#CCCCCC",

  // Brand Colors - Petshop Playful
  orange: "#FF9500",
  orangeDark: "#E67E00",
  orangeLight: "#FFB84D",
  
  green: "#22C55E",
  greenDark: "#16A34A",
  greenLight: "#4ADE80",

  teal: "#06B6D4",
  tealDark: "#0891B2",
  tealLight: "#22D3EE",

  // Semantic colors
  success: "#22C55E",
  successLight: "#4ADE80",
  successDark: "#16A34A",
  
  warning: "#F59E0B",
  warningLight: "#FBBF24",
  warningDark: "#D97706",
  
  danger: "#EF4444",
  dangerLight: "#F87171",
  dangerDark: "#DC2626",

  // Borders & Lines
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  borderDark: "#D0D0D0",

  // Overlays & Backdrops
  overlay: "rgba(31, 31, 31, 0.6)",
  overlayLight: "rgba(10, 14, 39, 0.5)",
  overlayDark: "rgba(10, 14, 39, 0.95)",

  // Legacy (compatibilidad)
  navy: "#0B2239",
  brand: "#00D4FF",
  sky: "#DFF4FF",
  soft: "#A8B2C1",
  accent: "#FF006E",
  line: "#3A4260"
} as const;

export type ColorKey = keyof typeof colors;

/**
 * Gradients cinematográficos
 */
export const gradients = {
  hero: "linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #2A3150 100%)",
  accent: "linear-gradient(135deg, #00D4FF 0%, #FF006E 100%)",
  magentaCyan: "linear-gradient(135deg, #FF006E 0%, #00D4FF 100%)",
  darkBlue: "linear-gradient(135deg, #0A0E27 0%, #00A8CC 100%)",
  card: "linear-gradient(135deg, rgba(42, 49, 80, 0.8) 0%, rgba(36, 42, 71, 0.8) 100%)",
  glow: "radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.2) 0%, transparent 100%)",
  glowMagenta: "radial-gradient(circle at 50% 50%, rgba(255, 0, 110, 0.2) 0%, transparent 100%)"
} as const;
