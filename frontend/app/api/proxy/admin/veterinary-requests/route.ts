import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const TIMEOUT_MS = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? "PENDING";

  let upstream: Response;
  try {
    upstream = await fetchWithTimeout(
      `${API_GATEWAY_URL}/api/admin/veterinary-requests?status=${status}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
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
