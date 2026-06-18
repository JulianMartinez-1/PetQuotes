import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
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

    // Aquí guardas el mensaje en tu base de datos
    // Ejemplo con Prisma:
    // const contact = await prisma.contactMessage.create({
    //   data: {
    //     userId: session.user.id,
    //     clinicId,
    //     petId,
    //     message: message.trim(),
    //     status: "PENDING",
    //   },
    // });

    // También podrías enviar una notificación push o email a la veterinaria

    return NextResponse.json(
      { message: "Mensaje enviado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en contact-clinic:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}