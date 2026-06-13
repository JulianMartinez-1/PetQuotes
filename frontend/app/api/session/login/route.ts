import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";
import { setCsrfCookie } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const body = await request.json();
  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackend("/auth/login", body);
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  const auth = await backendResponse.json();
  const sessionData = normalizeSessionResponse(auth);
  
  console.log("[Login API] ✅ Backend response OK");
  console.log(`[Login API] Usuario: ${sessionData.user.email}`);
  console.log(`[Login API] Access token recibido: ${auth.accessToken?.substring(0, 20)}...`);
  console.log(`[Login API] Refresh token recibido: ${auth.refreshToken?.substring(0, 20)}...`);
  
  // Crear respuesta con JSON
  const response = NextResponse.json(sessionData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Login-Success": "true",
      "Content-Type": "application/json; charset=utf-8"
    }
  });
  
  // Establecer las cookies en la respuesta
  console.log("[Login API] Estableciendo cookies...");
  setSessionCookies(response, auth);
  setCsrfCookie(response);
  
  // Verificar que las cookies se establecieron
  const setCookieHeaders = response.headers.getSetCookie();
  console.log(`[Login API] ✅ ${setCookieHeaders.length} Set-Cookie headers establecidos`);
  setCookieHeaders.forEach((header, index) => {
    const cookieName = header.split("=")[0];
    console.log(`[Login API] Cookie ${index + 1}: ${cookieName}`);
  });
  
  return response;
}
