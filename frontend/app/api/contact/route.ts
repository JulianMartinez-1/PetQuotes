import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ message: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: err.message ?? "Error enviando el mensaje" },
        { status: response.status },
      );
    }

    return NextResponse.json({ message: "Consulta enviada correctamente" });
  } catch {
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
