import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  
  if (!accessToken) {
    return NextResponse.json(
      { message: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { clinicId, petId, service, date, time, notes } = body;

    if (!petId || !service || !date || !time) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Crear la reserva en el backend
    const response = await fetchWithTimeout(
      `${API_GATEWAY_URL}/api/appointments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          clinicId,
          petId,
          service,
          date,
          time,
          notes,
        }),
        cache: "no-store",
      },
      8000
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
      return NextResponse.json(
        { message: errorData.message || "Error al crear la reserva" },
        { status: response.status }
      );
    }

    const booking = await response.json();
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookings] Error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
