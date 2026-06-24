import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { assertDoubleSubmitCsrf } from "@/lib/csrf";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);

function getToken(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
}

export async function GET(request: NextRequest) {
  const accessToken = getToken(request);
  if (!accessToken) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(
      `${API_GATEWAY_URL}/api/veterinary/my-profile`,
      { method: "GET", headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
      TIMEOUT_MS,
    );
  } catch {
    return NextResponse.json({ message: "El servidor tardó demasiado" }, { status: 504 });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}

export async function PATCH(request: NextRequest) {
  if (!assertDoubleSubmitCsrf(request)) {
    return NextResponse.json({ message: "No se pudo validar la solicitud" }, { status: 403 });
  }

  const accessToken = getToken(request);
  if (!accessToken) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  const body = await request.json();

  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(
      `${API_GATEWAY_URL}/api/veterinary/my-profile`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      TIMEOUT_MS,
    );
  } catch {
    return NextResponse.json({ message: "El servidor tardó demasiado" }, { status: 504 });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
