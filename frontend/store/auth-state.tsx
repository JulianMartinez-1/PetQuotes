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
    console.log("[Auth] useEffect bootstrap ejecutado");
    let mounted = true;

    const bootstrap = async () => {
      try {
        console.log("[Auth] bootstrap iniciado");
        // Restaurar desde localStorage si existe
        const savedUser = localStorage.getItem("auth_user");
        console.log("[Auth] localStorage.getItem('auth_user'):", savedUser);
        
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser) as AuthUser;
            if (mounted) {
              console.log("[Auth] Usuario restaurado de localStorage:", parsedUser.email);
              setUser(parsedUser);
            }
          } catch (err) {
            console.log("[Auth] Error parseando localStorage:", err);
            localStorage.removeItem("auth_user");
          }
        } else {
          console.log("[Auth] No hay usuario en localStorage");
        }
      } finally {
        if (mounted) {
          console.log("[Auth] Bootstrap completado, estableciendo isHydrated=true");
          setIsHydrated(true);
        }
      }
    };

    void bootstrap();
    return () => { 
      console.log("[Auth] Cleanup del bootstrap useEffect");
      mounted = false; 
    };
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

  const login = ({ user: nextUser }: { user: AuthUser }) => {
    console.log("[Auth] login() llamado con:", nextUser.email);
    syncAuth({ user: nextUser });
  };

  const logout = () => {
    void logoutRequest();
    clearAuth();
  };

  const value = useMemo(
    () => ({ user, isHydrated, isAuthenticated: Boolean(user), login, logout }),
    [user, isHydrated]
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
