"use client";

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

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
const AuthStateContext = createContext<AuthStateContextValue | null>(null);

export function AuthStateProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { token: string; refreshToken: string; user: AuthUser };
      setToken(parsed.token);
      setRefreshToken(parsed.refreshToken);
      setUser(parsed.user);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = ({ token: nextToken, refreshToken: nextRefreshToken, user: nextUser }: { token: string; refreshToken: string; user: AuthUser }) => {
    setToken(nextToken);
    setRefreshToken(nextRefreshToken);
    setUser(nextUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, refreshToken: nextRefreshToken, user: nextUser }));
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
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
