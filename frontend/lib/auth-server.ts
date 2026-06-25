import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES, AUTH_COOKIE_TTL, getAuthCookieOptions } from "@/lib/auth-cookies";
import { AuthRole, decodeJwtPayload } from "@/lib/auth-jwt";
import { extractErrorMessage, normalizeApiErrorMessage, parseErrorPayload } from "@/lib/error-copy";
import { fetchWithTimeout } from "@/lib/server-fetch";

type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  fullName: string;
  role: AuthRole;
  veterinaryStatus?: string;
};

export type SessionAuthResponse = {
  user: {
    id: string;
    email: string;
    role: AuthRole;
    fullName: string;
    veterinaryStatus?: string;
  };
};

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function callAuthBackend(path: string, body: unknown, bearerToken?: string) {
  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  const response = await fetchWithTimeout(`${API_GATEWAY_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store"
  }, timeoutMs);

  return response;
}

export async function callAuthBackendRequest(path: string, options?: {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}) {
  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  const method = options?.method ?? "POST";

  const response = await fetchWithTimeout(
    `${API_GATEWAY_URL}${path}`,
    {
      method,
      headers: {
        ...(options?.body !== undefined ? { "Content-Type": "application/json" } : {})
      },
      ...(options?.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      cache: "no-store"
    },
    timeoutMs
  );

  return response;
}

export function normalizeSessionResponse(raw: BackendAuthResponse): SessionAuthResponse {
  const payload = decodeJwtPayload(raw.accessToken);

  const role = (payload.role as AuthRole) ?? raw.role;

  return {
    user: {
      id: payload.sub ?? raw.userId ?? "unknown",
      email: payload.email ?? raw.email ?? "unknown@petquotes.local",
      role,
      fullName: payload.fullName ?? raw.fullName ?? (payload.email?.split("@")[0] ?? "Usuario"),
      veterinaryStatus: raw.veterinaryStatus,
    }
  };
}

export function setSessionCookies(response: NextResponse, auth: BackendAuthResponse) {
  response.cookies.set(AUTH_COOKIE_NAMES.access, auth.accessToken, getAuthCookieOptions(AUTH_COOKIE_TTL.accessSeconds));
  response.cookies.set(AUTH_COOKIE_NAMES.refresh, auth.refreshToken, getAuthCookieOptions(AUTH_COOKIE_TTL.refreshSeconds));
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAMES.access, "", getAuthCookieOptions(0));
  response.cookies.set(AUTH_COOKIE_NAMES.refresh, "", getAuthCookieOptions(0));
}

export function getRefreshTokenFromRequest(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE_NAMES.refresh)?.value;
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return false;
  try {
    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      { method: "POST", cache: "no-store" }
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function getErrorPayload(response: Response) {
  const text = await response.text();
  const payload = parseErrorPayload(text);
  const rawMessage = extractErrorMessage(payload);
  return normalizeApiErrorMessage(response.status, rawMessage);
}
