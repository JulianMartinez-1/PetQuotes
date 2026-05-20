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

    // Llamar a Ollama
    const ollamaUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "llama2";

    if (!ollamaUrl) {
      console.error("OLLAMA_API_URL no está configurada");
      return NextResponse.json(
        {
          error:
            "Error del servidor: API de IA no configurada. Por favor contacta con soporte.",
        },
        { status: 500 }
      );
    }

    // Preparar el contenido del mensaje para Ollama (formato OpenAI-compatible)
    const ollamaMessages = [
      {
        role: "system",
        content: CHAT_SYSTEM_PROMPT,
      },
      ...messages,
    ];

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: ollamaMessages,
        stream: false,
        temperature: 0.7,
      }),
    });

    // Manejar errores de Ollama
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Ollama API Error:", errorData);

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: `Modelo Ollama '${model}' no encontrado. Por favor verifica la configuración.`,
          },
          { status: 500 }
        );
      }

      if (response.status === 503) {
        return NextResponse.json(
          {
            error:
              "El servicio de IA está ocupado. Por favor intenta en unos momentos.",
            retryAfter: 30,
          },
          { status: 429 }
        );
      }

      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.message?.content;

    if (!reply) {
      throw new Error("No se recibió respuesta válida de Ollama");
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
