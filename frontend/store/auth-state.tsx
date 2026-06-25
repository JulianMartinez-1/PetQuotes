"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { logoutRequest, refreshRequest } from "@/lib/auth-api";

type AuthUser = {
  id: string;
  email: string;
  role: "CLIENT" | "VETERINARY" | "ADMIN";
  fullName: string;
  veterinaryStatus?: string;
};

type AuthStateContextValue = {
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (payload: { user: AuthUser }) => void;
  logout: () => void;
};

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const AuthStateContext = createContext<AuthStateContextValue | null>(null);

export function AuthStateProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  // Incremented on every syncAuth call. Bootstrap reads a snapshot before the
  // async refresh so it can detect if a concurrent login() has already set a
  // fresh session and skip clearAuth() in that case.
  const loginGenRef = useRef(0);

  const syncAuth = useCallback((payload: { user: AuthUser }) => {
    loginGenRef.current += 1;
    try {
      setUser(payload.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(payload.user));
      }
    } catch (err) {
      console.error("[Auth] Error en syncAuth:", err);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    localStorage.removeItem("auth_user");
  }, []);

  // Initial load from localStorage
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        // Snapshot generation BEFORE the async refresh so we can detect if
        // a concurrent OAuth login() call has completed while we were waiting.
        const genSnapshot = loginGenRef.current;

        try {
          const parsedUser = JSON.parse(savedUser) as AuthUser;
          if (mounted) setUser(parsedUser);
        } catch {
          localStorage.removeItem("auth_user");
        }

        try {
          const { user: freshUser } = await refreshRequest();
          if (mounted) syncAuth({ user: freshUser });
        } catch {
          // Only clear if no concurrent login() set a fresh session while the
          // refresh was in flight. If loginGenRef changed, a login() already
          // established a valid session and we must not wipe it.
          if (mounted && loginGenRef.current === genSnapshot) {
            clearAuth();
          }
        }
      }

      if (mounted) setIsHydrated(true);
    };

    void bootstrap();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
