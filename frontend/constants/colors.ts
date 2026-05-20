/**
 * Paleta de colores moderna y profesional para plataforma veterinaria
 * Colores profesionales: Azul oscuro, secondary, Menta, Coral
 * Diseño limpio y moderno
 */

export const colors = {
  // Primary - Azul oscuro profesional
  primary: "#1D4ED8",       // Azul oscuro principal
  primaryHover: "#2563EB",  // Azul hover
  primaryDark: "#1E40AF",   // Azul más oscuro
  primaryLight: "#DBEAFE",  // Azul muy claro

  // Secondary - secondary brillante
  secondary: "#06B6D4",     // secondary principal
  secondaryHover: "#0891B2", // secondary hover
  secondaryDark: "#0E7490", // secondary más oscuro
  secondaryLight: "#CFFAFE", // secondary muy claro

  // Mint - Verde menta
  mint: "#10B981",          // Verde menta principal
  mintHover: "#059669",     // Verde menta hover
  mintDark: "#047857",      // Verde menta más oscuro
  mintLight: "#D1FAE5",     // Verde menta muy claro

  // Accent - Coral
  accent: "#FB7185",        // Coral principal
  accentHover: "#F43F5E",   // Coral hover
  accentDark: "#E11D48",    // Coral más oscuro
  accentLight: "#FFE4E6",   // Coral muy claro

  // Background & Surface
  background: "#F1F5F9",    // Fondo principal claro
  surface: "#FFFFFF",       // Superficie blanca
  surfaceLight: "#F8FAFC",  // Gris muy claro
  surface2: "#E2E8F0",      // Gris claro

  // Text - Texto oscuro sobre fondos claros
  textPrimary: "#0F172A",   // Texto principal oscuro
  textSecondary: "#475569", // Texto secundario
  textTertiary: "#64748B",  // Texto terciario
  textMuted: "#94A3B8",     // Texto suave

  // Semantic colors
  success: "#10B981",       // Verde menta para éxito
  successLight: "#D1FAE5",  // Verde muy claro
  successDark: "#047857",   // Verde más oscuro
  
  warning: "#F59E0B",       // Ámbar para advertencia
  warningLight: "#FEF3C7",  // Ámbar muy claro
  warningDark: "#D97706",   // Ámbar más oscuro
  
  danger: "#EF4444",        // Rojo para peligro
  dangerLight: "#FEE2E2",   // Rojo muy claro
  dangerDark: "#DC2626",    // Rojo más oscuro

  // Borders & Lines
  border: "#CBD5E1",        // Borde estándar
  borderLight: "#E2E8F0",   // Borde claro
  borderDark: "#94A3B8",    // Borde oscuro

  // Overlays & Backdrops
  overlay: "rgba(15, 23, 42, 0.7)",
  overlayLight: "rgba(15, 23, 42, 0.5)",
  overlayDark: "rgba(15, 23, 42, 0.9)",

  // Legacy (compatibilidad)
  navy: "#1D4ED8",          // Azul oscuro principal
  brand: "#06B6D4",         // secondary secundario
  sky: "#CFFAFE",           // secondary claro
  soft: "#E2E8F0",          // Gris claro
  line: "#CBD5E1"           // Borde
} as const;

export type ColorKey = keyof typeof colors;

/**
 * Gradients - Moderna paleta profesional
 */
export const gradients = {
  hero: "linear-gradient(135deg, #06B6D4 0%, #1D4ED8 50%, #FB7185 100%)",
  accent: "linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)",
  accentsecondary: "linear-gradient(135deg, #FB7185 0%, #06B6D4 100%)",
  darkBlue: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
  card: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)",
  glow: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.2) 0%, transparent 100%)",
  glowaccent: "radial-gradient(circle at 50% 50%, rgba(251, 113, 133, 0.2) 0%, transparent 100%)",
  mint: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
} as const;

