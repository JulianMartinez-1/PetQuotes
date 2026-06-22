import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { fetchWithTimeout } from "@/lib/server-fetch";
import { extractErrorMessage, normalizeApiErrorMessage, parseErrorPayload } from "@/lib/error-copy";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS ?? 15000);

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }
  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(`${API_GATEWAY_URL}/api/analytics/pets`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }, TIMEOUT_MS);
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }
  const text = await upstream.text();
  if (!upstream.ok) {
    const payload = parseErrorPayload(text);
    return NextResponse.json({ message: normalizeApiErrorMessage(upstream.status, extractErrorMessage(payload)) }, { status: upstream.status });
  }
  return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
}
