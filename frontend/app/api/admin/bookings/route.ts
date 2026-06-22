import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_GATEWAY_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  try {
    const response = await fetchWithTimeout(
      `${API_GATEWAY_URL}/api/appointments/admin/all`,
      { method: "GET", headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
      8000
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: err.message || "Error al cargar reservas" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
