import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload, getRefreshTokenFromRequest, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
  }

  const backendResponse = await callAuthBackend("/auth/refresh", { refreshToken });

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  const auth = await backendResponse.json();
  const response = NextResponse.json(normalizeSessionResponse(auth));
  setSessionCookies(response, auth);
  return response;
}
