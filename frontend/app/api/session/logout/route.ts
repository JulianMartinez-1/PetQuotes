import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, clearSessionCookies, getRefreshTokenFromRequest } from "@/lib/auth-server";
import { assertDoubleSubmitCsrf, clearCsrfCookie } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  if (!assertDoubleSubmitCsrf(request)) {
    return NextResponse.json({ message: "No se pudo validar la solicitud. Recarga la pagina e intenta de nuevo." }, { status: 403 });
  }

  const refreshToken = getRefreshTokenFromRequest(request);

  if (refreshToken) {
    await callAuthBackend("/api/auth/logout", { refreshToken });
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  clearCsrfCookie(response);
  return response;
}
