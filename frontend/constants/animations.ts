/**
 * Configuraciones de animación global
 * Inspiradas en movimiento cinematográfico premium
 */

import type { Variants } from "framer-motion";

// Duraciones estándar (ms)
export const DURATIONS = {
  fast: 150,
  base: 300,
  slow: 500,
  slower: 700,
  verySlow: 1000
} as const;

// Easing functions
export const EASING = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0.2, 1, 0.3, 1],
  easeIn: [0.4, 0, 1, 1],
  elastic: [0.34, 1.56, 0.64, 1],
  smooth: [0.25, 0.46, 0.45, 0.94]
} as const;

// Variantes de entrada
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.base / 1000,
      ease: EASING.easeOut
    }
  }
};

// Fade animations
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATIONS.slow / 1000,
      ease: EASING.easeOut
    }
  }
};

// Scale animations
export const scaleInVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: DURATIONS.base / 1000,
      ease: EASING.elastic
    }
  }
};

// Slide animations
export const slideUpVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.slow / 1000,
      ease: EASING.easeOut
    }
  }
};

export const slideDownVariants: Variants = {
  hidden: { y: -40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.slow / 1000,
      ease: EASING.easeOut
    }
  }
};

export const slideLeftVariants: Variants = {
  hidden: { x: -40, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.slow / 1000,
      ease: EASING.easeOut
    }
  }
};

export const slideRightVariants: Variants = {
  hidden: { x: 40, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.slow / 1000,
      ease: EASING.easeOut
    }
  }
};

// Hover animations
export const hoverScaleVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: DURATIONS.base / 1000 }
  }
};

export const hoverLiftVariants: Variants = {
  rest: { y: 0, boxShadow: "0 0 0px rgba(0, 0, 0, 0)" },
  hover: {
    y: -8,
    boxShadow: "0 20px 40px rgba(0, 212, 255, 0.15)",
    transition: { duration: DURATIONS.base / 1000 }
  }
};

// Glow animations
export const glowVariants: Variants = {
  rest: { boxShadow: "0 0 0px rgba(0, 212, 255, 0.3)" },
  hover: {
    boxShadow: [
      "0 0 10px rgba(0, 212, 255, 0.3)",
      "0 0 30px rgba(0, 212, 255, 0.6)",
      "0 0 10px rgba(0, 212, 255, 0.3)"
    ],
    transition: { duration: DURATIONS.base / 1000 }
  }
};

// Page transitions
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Stagger animations para listas
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.base / 1000,
      ease: EASING.easeOut
    }
  }
};
