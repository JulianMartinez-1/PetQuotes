import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, clearSessionCookies, getRefreshTokenFromRequest } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshTokenFromRequest(request);

  if (refreshToken) {
    await callAuthBackend("/auth/logout", { refreshToken });
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  return response;
}
