import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES, AUTH_COOKIE_TTL, getAuthCookieOptions } from "@/lib/auth-cookies";
import { AuthRole, decodeJwtPayload } from "@/lib/auth-jwt";

type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: AuthRole;
};

export type SessionAuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: AuthRole;
  };
};

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function callAuthBackend(path: string, body: unknown) {
  const response = await fetch(`${API_GATEWAY_URL}/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  return response;
}

export function normalizeSessionResponse(raw: BackendAuthResponse): SessionAuthResponse {
  const payload = decodeJwtPayload(raw.accessToken);

  return {
    accessToken: raw.accessToken,
    user: {
      id: payload.sub ?? "unknown",
      email: payload.email ?? "unknown@petquotes.local",
      role: raw.role
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

export async function getErrorPayload(response: Response) {
  const text = await response.text();
  return text || `Request failed with status ${response.status}`;
}
