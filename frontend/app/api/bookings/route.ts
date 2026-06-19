import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  
  console.log("[POST /api/bookings] Request received");
  console.log("[POST /api/bookings] Has accessToken:", !!accessToken);

  if (!accessToken) {
    console.log("[POST /api/bookings] No accessToken found");
    return NextResponse.json(
      { message: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { clinicId, petId, service, date, time, notes } = body;

    console.log("[POST /api/bookings] Body:", { clinicId, petId, service, date, time, notes });

    if (!petId || !service || !date || !time) {
      console.log("[POST /api/bookings] Missing required fields");
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Crear la reserva en el backend
    const backendUrl = `${API_GATEWAY_URL}/api/appointments`;
    console.log("[POST /api/bookings] Calling backend:", backendUrl);

    const response = await fetchWithTimeout(
      backendUrl,
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

    console.log("[POST /api/bookings] Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
      console.error("[POST /api/bookings] Backend error response:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Error al crear la reserva" },
        { status: response.status }
      );
    }

    const booking = await response.json();
    console.log("[POST /api/bookings] Success:", booking);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookings] Error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
