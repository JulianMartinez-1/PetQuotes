/**
 * Sistema tipográfico moderno
 * Font: Inter + Poppins
 */

export const typography = {
  // Display - Títulos principales
  display: {
    xl: { size: "3.5rem", weight: 700, lineHeight: 1.1 },
    lg: { size: "3rem", weight: 700, lineHeight: 1.1 },
    md: { size: "2.5rem", weight: 700, lineHeight: 1.2 },
    sm: { size: "2rem", weight: 600, lineHeight: 1.2 }
  },

  // Heading - Subtítulos
  heading: {
    xl: { size: "2rem", weight: 600, lineHeight: 1.25 },
    lg: { size: "1.75rem", weight: 600, lineHeight: 1.3 },
    md: { size: "1.5rem", weight: 600, lineHeight: 1.33 },
    sm: { size: "1.25rem", weight: 600, lineHeight: 1.4 }
  },

  // Body - Cuerpo de texto
  body: {
    lg: { size: "1.125rem", weight: 400, lineHeight: 1.6 },
    base: { size: "1rem", weight: 400, lineHeight: 1.5 },
    sm: { size: "0.875rem", weight: 400, lineHeight: 1.5 },
    xs: { size: "0.75rem", weight: 400, lineHeight: 1.4 }
  },

  // Label - Labels y captions
  label: {
    lg: { size: "0.875rem", weight: 600, lineHeight: 1.3 },
    base: { size: "0.75rem", weight: 600, lineHeight: 1.3 },
    sm: { size: "0.625rem", weight: 600, lineHeight: 1.2 }
  }
} as const;

// Clases CSS para uso directo
export const typeClasses = {
  displayXl: "font-display text-display-xl font-bold tracking-tight",
  displayLg: "font-display text-display-lg font-bold tracking-tight",
  displayMd: "font-display text-display-md font-bold tracking-tight",
  displaySm: "font-display text-display-sm font-semibold",
  
  headingXl: "font-display text-2xl font-semibold tracking-tight",
  headingLg: "font-display text-xl font-semibold tracking-tight",
  headingMd: "font-display text-lg font-semibold",
  headingSm: "font-display text-base font-semibold",
  
  bodyLg: "font-sans text-lg font-normal leading-relaxed",
  bodyBase: "font-sans text-base font-normal leading-normal",
  bodySm: "font-sans text-sm font-normal leading-normal",
  bodyXs: "font-sans text-xs font-normal leading-tight",
  
  labelLg: "font-sans text-sm font-semibold uppercase tracking-wide",
  labelBase: "font-sans text-xs font-semibold uppercase tracking-wider",
  labelSm: "font-sans text-xs font-bold uppercase tracking-wider"
} as const;
