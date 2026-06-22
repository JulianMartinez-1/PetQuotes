import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_BASE =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/users/me`,
      { method: "GET", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
      6000
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ message: err.message ?? "Error al obtener perfil" }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const res = await fetchWithTimeout(
      `${API_BASE}/api/users/me`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      6000
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ message: err.message ?? "Error al actualizar perfil" }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
