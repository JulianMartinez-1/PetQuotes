import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { extractErrorMessage, normalizeApiErrorMessage, parseErrorPayload } from "@/lib/error-copy";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type RouteContext = {
  params: Promise<{
    petId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }

  const { petId } = await context.params;

  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  let upstream: Response;

  try {
    upstream = await fetchWithTimeout(`${API_GATEWAY_URL}/api/appointments/pet/${petId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-request-id": request.headers.get("x-request-id") ?? "web-proxy-pet-history"
      },
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
