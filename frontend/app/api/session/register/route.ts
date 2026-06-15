import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";
import { setCsrfCookie } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const body = await request.json();
  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackend("/api/auth/register", body);
  } catch (err) {
    console.error("[Register API] ❌ Error llamando backend:", err);
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    const errorMsg = await getErrorPayload(backendResponse);
    console.error(`[Register API] ❌ Backend devolvió error ${backendResponse.status}: ${errorMsg}`);
    return NextResponse.json({ message: errorMsg }, { status: backendResponse.status });
  }

  try {
    const auth = await backendResponse.json();
    console.log("[Register API] 📦 Respuesta del backend recibida");
    console.log("[Register API] Campos recibidos:", Object.keys(auth));
    
    let sessionData;
    try {
      sessionData = normalizeSessionResponse(auth);
      console.log("[Register API] ✅ normalizeSessionResponse exitoso");
    } catch (normalizeErr) {
      console.error("[Register API] ❌ Error normalizando respuesta:", normalizeErr);
      // Fallback: crear estructura manual
      sessionData = {
        user: {
          id: auth.userId || "unknown",
          email: auth.email || "unknown@petquotes.local",
          role: auth.role || "CLIENT",
          fullName: auth.fullName || "Usuario"
        }
      };
      console.log("[Register API] ⚠️ Usando respuesta manual fallback");
    }
    
    console.log("[Register API] ✅ Backend response OK");
    console.log(`[Register API] Usuario registrado: ${sessionData.user.email}`);
    
    const response = NextResponse.json(sessionData, {
      status: 201,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Register-Success": "true",
        "Content-Type": "application/json; charset=utf-8"
      }
    });
    
    setSessionCookies(response, auth);
    setCsrfCookie(response);
    
    const setCookieHeaders = response.headers.getSetCookie();
    console.log(`[Register API] ✅ ${setCookieHeaders.length} Set-Cookie headers establecidos`);
    
    return response;
  } catch (err) {
    console.error("[Register API] ❌ Error procesando respuesta:", err);
    return NextResponse.json(
      { message: "Error procesando respuesta del servidor" },
      { status: 500 }
    );
  }
}
