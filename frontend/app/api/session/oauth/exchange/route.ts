import { NextRequest, NextResponse } from "next/server";
import { callAuthBackendRequest, getErrorPayload, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";
import { setCsrfCookie } from "@/lib/csrf";

const OAUTH_STATE_COOKIE = "pq_oauth_state";

function clearStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    provider?: string;
    code?: string;
    state?: string;
    redirectUri?: string;
  };

  if (!body.provider || !body.code || !body.state || !body.redirectUri) {
    return NextResponse.json({ message: "Faltan datos para completar autenticacion social" }, { status: 400 });
  }

  // Validate CSRF state: compare cookie (set on /start) with the value Google returned
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!storedState || storedState !== body.state) {
    return NextResponse.json(
      { message: "Estado OAuth inválido o expirado. Intenta iniciar sesión nuevamente." },
      { status: 400 }
    );
  }

  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackendRequest(`/api/auth/oauth/${body.provider}/exchange`, {
      method: "POST",
      body: {
        provider: body.provider,
        code: body.code,
        state: body.state,
        redirectUri: body.redirectUri,
      },
    });
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    const errorResp = NextResponse.json(
      { message: await getErrorPayload(backendResponse) },
      { status: backendResponse.status }
    );
    clearStateCookie(errorResp);
    return errorResp;
  }

  const data = await backendResponse.json();

  // Returning user: backend issued tokens directly — set cookies and return session
  if (data.requiresProfileCompletion === false && data.accessToken) {
    const sessionResponse = NextResponse.json(normalizeSessionResponse(data));
    clearStateCookie(sessionResponse);
    setSessionCookies(sessionResponse, data);
    setCsrfCookie(sessionResponse);
    return sessionResponse;
  }

  // New user: pass through the completionToken for the profile-completion step
  const passThrough = NextResponse.json(data);
  clearStateCookie(passThrough);
  return passThrough;
}
