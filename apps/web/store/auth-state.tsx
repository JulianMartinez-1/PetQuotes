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

const REFRESH_INTERVAL_MS = 8 * 60 * 1000;
const AuthStateContext = createContext<AuthStateContextValue | null>(null);

export function AuthStateProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const syncAuth = useCallback((payload: { user: AuthUser }) => {
    setUser(payload.user);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await refreshRequest();
        if (!mounted) return;
        syncAuth({ user: response.user });
      } catch {
        if (!mounted) return;
        clearAuth();
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [clearAuth, syncAuth]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await refreshRequest();
      syncAuth({ user: response.user });
    } catch {
      clearAuth();
    }
  }, [clearAuth, syncAuth]);

  useEffect(() => {
    if (!isHydrated || !user) return;

    const interval = window.setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isHydrated, refreshSession, user]);

  const login = ({ user: nextUser }: { user: AuthUser }) => {
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
