"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { logoutRequest, refreshRequest } from "@/lib/auth-api";
import { setAccessToken } from "@/lib/api-client";

type AuthUser = {
  id: string;
  email: string;
  role: "CLIENT" | "VETERINARY" | "ADMIN";
};

type AuthStateContextValue = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
};

const REFRESH_INTERVAL_MS = 8 * 60 * 1000;
const AuthStateContext = createContext<AuthStateContextValue | null>(null);

export function AuthStateProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const syncAuth = useCallback((payload: { token: string; user: AuthUser }) => {
    setToken(payload.token);
    setUser(payload.user);
    setAccessToken(payload.token);
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await refreshRequest();
        if (!mounted) return;
        syncAuth({ token: response.accessToken, user: response.user });
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
      syncAuth({ token: response.accessToken, user: response.user });
    } catch {
      clearAuth();
    }
  }, [clearAuth, syncAuth]);

  useEffect(() => {
    if (!isHydrated || !token) return;

    const interval = window.setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isHydrated, refreshSession, token]);

  const login = ({ token: nextToken, user: nextUser }: { token: string; user: AuthUser }) => {
    syncAuth({ token: nextToken, user: nextUser });
  };

  const logout = () => {
    void logoutRequest();
    clearAuth();
  };

  const value = useMemo(
    () => ({ token, user, isHydrated, isAuthenticated: Boolean(token && user), login, logout }),
    [token, user, isHydrated]
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
