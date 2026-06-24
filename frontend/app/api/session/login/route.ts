import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload, normalizeSessionResponse, setSessionCookies, verifyRecaptcha } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";
import { setCsrfCookie } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { captchaToken, ...forwardBody } = body;

  const captchaValid = await verifyRecaptcha(captchaToken ?? "");
  if (!captchaValid) {
    return NextResponse.json({ message: "Verificación reCAPTCHA fallida. Inténtalo de nuevo." }, { status: 400 });
  }

  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackend("/api/auth/login", forwardBody);
  } catch (err) {
    console.error("[Login API] ❌ Error llamando backend:", err);
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout", "/api/session/login") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    const errorMsg = await getErrorPayload(backendResponse);
    console.error(`[Login API] ❌ Backend devolvió error ${backendResponse.status}: ${errorMsg}`);
    return NextResponse.json({ message: errorMsg }, { status: backendResponse.status });
  }

  try {
    const auth = await backendResponse.json();
    console.log("[Login API] 📦 Respuesta del backend recibida");
    console.log("[Login API] Campos recibidos:", Object.keys(auth));
    
    let sessionData;
    try {
      sessionData = normalizeSessionResponse(auth);
      console.log("[Login API] ✅ normalizeSessionResponse exitoso");
    } catch (normalizeErr) {
      console.error("[Login API] ❌ Error normalizando respuesta:", normalizeErr);
      // Fallback: crear estructura manual
      sessionData = {
        user: {
          id: auth.userId || "unknown",
          email: auth.email || "unknown@petquotes.local",
          role: auth.role || "CLIENT",
          fullName: auth.fullName || "Usuario"
        }
      };
      console.log("[Login API] ⚠️ Usando respuesta manual fallback");
    }
    
    console.log("[Login API] ✅ Backend response OK");
    console.log(`[Login API] Usuario: ${sessionData.user.email}`);
    console.log(`[Login API] Access token recibido: ${auth.accessToken?.substring(0, 20)}...`);
    console.log(`[Login API] Refresh token recibido: ${auth.refreshToken?.substring(0, 20)}...`);
    
    // Crear respuesta con JSON - solo enviar el usuario, no los tokens
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
  } catch (err) {
    console.error("[Login API] ❌ Error procesando respuesta:", err);
    return NextResponse.json(
      { message: "Error procesando respuesta del servidor" },
      { status: 500 }
    );
  }
}
