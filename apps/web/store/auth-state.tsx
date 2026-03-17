"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { refreshRequest } from "@/lib/auth-api";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookies";

type AuthUser = {
  id: string;
  email: string;
  role: "CLIENT" | "VETERINARY" | "ADMIN";
};

type AuthStateContextValue = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (payload: { token: string; refreshToken: string; user: AuthUser }) => void;
  logout: () => void;
};

const STORAGE_KEY = "petquotes.auth.v1";
const REFRESH_INTERVAL_MS = 8 * 60 * 1000;
const AuthStateContext = createContext<AuthStateContextValue | null>(null);

export function AuthStateProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const syncPersistedAuth = useCallback((payload: { token: string; refreshToken: string; user: AuthUser }) => {
    setToken(payload.token);
    setRefreshToken(payload.refreshToken);
    setUser(payload.user);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuthCookies(payload.token, payload.refreshToken);
  }, []);

  const clearPersistedAuth = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
    clearAuthCookies();
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setIsHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { token: string; refreshToken: string; user: AuthUser };
      syncPersistedAuth(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, [syncPersistedAuth]);

  const refreshSession = useCallback(async () => {
    if (!refreshToken) return;

    try {
      const response = await refreshRequest(refreshToken);
      syncPersistedAuth({
        token: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user
      });
    } catch {
      clearPersistedAuth();
    }
  }, [clearPersistedAuth, refreshToken, syncPersistedAuth]);

  useEffect(() => {
    if (!isHydrated || !refreshToken) return;

    const interval = window.setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isHydrated, refreshSession, refreshToken]);

  const login = ({ token: nextToken, refreshToken: nextRefreshToken, user: nextUser }: { token: string; refreshToken: string; user: AuthUser }) => {
    syncPersistedAuth({ token: nextToken, refreshToken: nextRefreshToken, user: nextUser });
  };

  const logout = () => {
    clearPersistedAuth();
  };

  const value = useMemo(
    () => ({ token, refreshToken, user, isHydrated, isAuthenticated: Boolean(token && user), login, logout }),
    [token, refreshToken, user, isHydrated]
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
