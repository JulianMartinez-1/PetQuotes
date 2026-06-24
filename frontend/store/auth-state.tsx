"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { logoutRequest, refreshRequest } from "@/lib/auth-api";

type AuthUser = {
  id: string;
  email: string;
  role: "CLIENT" | "VETERINARY" | "ADMIN";
  fullName: string;
};

type AuthStateContextValue = {
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (payload: { user: AuthUser }) => void;
  logout: () => void;
};

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // Reducido a 5 minutos para refrescar más frecuentemente
const AuthStateContext = createContext<AuthStateContextValue | null>(null);

export function AuthStateProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const syncAuth = useCallback((payload: { user: AuthUser }) => {
    try {
      console.log("[Auth] syncAuth llamado con usuario:", payload.user);
      setUser(payload.user);
      if (typeof window !== "undefined") {
        const serialized = JSON.stringify(payload.user);
        localStorage.setItem("auth_user", serialized);
        console.log("[Auth] Guardado en localStorage, verificando:", localStorage.getItem("auth_user"));
      }
    } catch (err) {
      console.error("[Auth] Error en syncAuth:", err);
    }
  }, []);

  const clearAuth = useCallback(() => {
    console.log("[Auth] clearAuth llamado");
    setUser(null);
    localStorage.removeItem("auth_user");
  }, []);

  // Initial load from localStorage
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as AuthUser;
          if (mounted) setUser(parsedUser);
        } catch {
          localStorage.removeItem("auth_user");
        }
      }

      if (mounted) setIsHydrated(true);

      // Silently refresh the access token cookie so protected routes
      // and API calls work even if the short-lived cookie has expired.
      if (savedUser && mounted) {
        try {
          const { user: freshUser } = await refreshRequest();
          if (mounted) syncAuth({ user: freshUser });
        } catch {
          // Refresh failed — user stays logged in from localStorage until
          // their next explicit action triggers a 401.
        }
      }
    };

    void bootstrap();
    return () => { mounted = false; };
  }, []); // Empty dependency - solo ejecuta al montar

  const refreshSession = useCallback(async () => {
    try {
      const response = await refreshRequest();
      syncAuth({ user: response.user });
    } catch {
      // Si refresh falla, mantiene la sesión actual sin limpiarla
    }
  }, [syncAuth]);

  useEffect(() => {
    if (!isHydrated || !user) return;

    const interval = window.setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isHydrated, refreshSession, user]);

  const login = useCallback(({ user: nextUser }: { user: AuthUser }) => {
    console.log("[Auth] login() llamado con:", nextUser.email);
    syncAuth({ user: nextUser });
  }, [syncAuth]);

  const logout = useCallback(() => {
    void logoutRequest();
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({ user, isHydrated, isAuthenticated: Boolean(user), login, logout }),
    [user, isHydrated, login, logout]
  );

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthState must be used within AuthStateProvider");
  }
  return context;
}
