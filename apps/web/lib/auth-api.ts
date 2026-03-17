import { requestJson } from "@/lib/api-client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role?: "CLIENT" | "VETERINARY" | "ADMIN";
};

export type ForgotPasswordPayload = {
  email: string;
};

type RawAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: "CLIENT" | "VETERINARY" | "ADMIN";
};

export type AuthResponse = RawAuthResponse & {
  user: {
    id: string;
    email: string;
    role: "CLIENT" | "VETERINARY" | "ADMIN";
  };
};

type JwtPayload = {
  sub?: string;
  email?: string;
};

function decodeJwtPayload(token: string): JwtPayload {
  try {
    if (typeof atob !== "function") return {};
    const payload = token.split(".")[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return {};
  }
}

function normalizeAuth(raw: RawAuthResponse): AuthResponse {
  const payload = decodeJwtPayload(raw.accessToken);
  return {
    ...raw,
    user: {
      id: payload.sub ?? "unknown",
      email: payload.email ?? "unknown@petquotes.local",
      role: raw.role
    }
  };
}

export async function loginRequest(payload: LoginPayload) {
  const raw = await requestJson<RawAuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return normalizeAuth(raw);
}

export async function registerRequest(payload: RegisterPayload) {
  const raw = await requestJson<RawAuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      role: payload.role ?? "CLIENT"
    })
  });

  return normalizeAuth(raw);
}

export async function refreshRequest(refreshToken: string) {
  const raw = await requestJson<RawAuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });

  return normalizeAuth(raw);
}

export async function forgotPasswordRequest(payload: ForgotPasswordPayload) {
  return requestJson<{ success: boolean; message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
