import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-system-prompt";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

/**
 * POST /api/chat
 * Endpoint para procesar mensajes del chatbot con IA
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener IP del usuario para rate limiting
    const userIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Verificar rate limit
    const rateLimit = checkRateLimit(userIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Por favor intenta más tarde.",
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // Parsear request
    const body = (await request.json()) as ChatRequest;
    const { message, conversationHistory = [] } = body;

    // Validar input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "El mensaje es demasiado largo (máximo 1000 caracteres)" },
        { status: 400 }
      );
    }

    // Construir conversación con historial (mantener contexto)
    const messages: ChatMessage[] = [
      ...conversationHistory.slice(-10), // Últimos 10 mensajes para contexto
      { role: "user", content: message },
    ];

    // Llamar a Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY no está configurada");
      return NextResponse.json(
        {
          error:
            "Error del servidor: API de IA no configurada. Por favor contacta con soporte.",
        },
        { status: 500 }
      );
    }

    // Preparar el contenido del mensaje para Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system: {
            instructions: CHAT_SYSTEM_PROMPT,
          },
          contents: [
            ...conversationHistory.map((msg) => ({
              role: msg.role,
              parts: [{ text: msg.content }],
            })),
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    // Manejar errores de Gemini
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);

      if (response.status === 401) {
        return NextResponse.json(
          {
            error:
              "Error de autenticación con la API de IA. Por favor contacta con soporte.",
          },
          { status: 500 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "El servicio de IA está ocupado. Por favor intenta en unos momentos.",
            retryAfter: 30,
          },
          { status: 429 }
        );
      }

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("No se recibió respuesta válida de la API");
    }

    return NextResponse.json({
      reply: reply.trim(),
      success: true,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        error: `Error al procesar tu solicitud: ${errorMessage}. Por favor intenta de nuevo.`,
      },
      { status: 500 }
    );
  }
}

// GET para verificar que el endpoint está disponible
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Chat API endpoint disponible",
  });
}
