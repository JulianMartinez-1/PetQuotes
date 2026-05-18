import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { extractErrorMessage, normalizeApiErrorMessage, parseErrorPayload } from "@/lib/error-copy";
import { fetchWithTimeout } from "@/lib/server-fetch";
import { assertDoubleSubmitCsrf } from "@/lib/csrf";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  if (!assertDoubleSubmitCsrf(request)) {
    return NextResponse.json({ message: "No se pudo validar la solicitud. Recarga la pagina e intenta de nuevo." }, { status: 403 });
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }

  const payload = await request.json();
  const idempotencyKey = request.headers.get("x-idempotency-key") ?? undefined;

  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  let upstream: Response;

  try {
    upstream = await fetchWithTimeout(`${API_GATEWAY_URL}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {})
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    }, timeoutMs);
  } catch {
    return NextResponse.json(
      { message: normalizeApiErrorMessage(504, "upstream timeout") },
      { status: 504 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    const payload = parseErrorPayload(text);
    const rawMessage = extractErrorMessage(payload);
    return NextResponse.json(
      { message: normalizeApiErrorMessage(upstream.status, rawMessage) },
      { status: upstream.status }
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json"
    }
  });
}
