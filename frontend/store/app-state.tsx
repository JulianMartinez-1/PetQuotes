"use client";

import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

type AppStateContextValue = {
  mobileMenuOpen: boolean;
  selectedCity: string;
  setMobileMenuOpen: (open: boolean) => void;
  setSelectedCity: (city: string) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Bogota");

  const value = useMemo(
    () => ({ mobileMenuOpen, selectedCity, setMobileMenuOpen, setSelectedCity }),
    [mobileMenuOpen, selectedCity]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
