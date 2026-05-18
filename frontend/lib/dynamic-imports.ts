import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import type { DynamicOptionsLoadingProps } from "next/dynamic";

/**
 * Dynamic import utility for code splitting
 * Reduces initial bundle by lazy-loading components
 */
export function dynamicComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: (props: DynamicOptionsLoadingProps) => ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading,
    ssr: options?.ssr !== false,
  }) as ComponentType<P>;
}
