import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload, getRefreshTokenFromRequest, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";
import { assertDoubleSubmitCsrf, setCsrfCookie } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing refresh token") }, { status: 401 });
  }

  if (!assertDoubleSubmitCsrf(request)) {
    return NextResponse.json({ message: "No se pudo validar la solicitud. Recarga la pagina e intenta de nuevo." }, { status: 403 });
  }

  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackend("/api/auth/refresh", { refreshToken }, refreshToken);
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  const auth = await backendResponse.json();
  const response = NextResponse.json(normalizeSessionResponse(auth));
  setSessionCookies(response, auth);
  setCsrfCookie(response);
  return response;
}
