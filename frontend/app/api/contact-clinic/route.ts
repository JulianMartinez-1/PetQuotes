import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");
    if (!token) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clinicId, petId, message } = body;

    if (!clinicId || !petId || !message?.trim()) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Aquí guardarías en tu base de datos
    // Por ahora solo simulamos éxito
    console.log(`Mensaje para clínica ${clinicId} sobre mascota ${petId}: ${message}`);

    return NextResponse.json(
      { message: "Mensaje enviado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en /api/contact-clinic:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}