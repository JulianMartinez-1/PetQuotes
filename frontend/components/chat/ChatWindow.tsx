"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "bot" | "error";
  text: string;
  timestamp: Date;
}

interface ChatError {
  message: string;
  retryAfter?: number;
}

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "¡Hola! Soy tu asistente de IA de Pet Quotes 🐾. Estoy aquí para ayudarte con preguntas sobre nuestros servicios veterinarios, cuidado de mascotas y reservas de citas. ¿En qué puedo ayudarte?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    // Limpiar errores previos
    setError(null);

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Llamar a API de chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          // Rate limit
          setError({
            message: `Demasiadas solicitudes. Intenta de nuevo en ${errorData.retryAfter} segundos.`,
            retryAfter: errorData.retryAfter,
          });
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              type: "error",
              text: `⏳ Límite de velocidad alcanzado. Por favor espera ${errorData.retryAfter} segundos antes de enviar otro mensaje.`,
              timestamp: new Date(),
            },
          ]);
        } else {
          throw new Error(
            errorData.error || "Error al conectar con el servidor"
          );
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Agregar respuesta del bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";

      // Agregar mensaje de error
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "error",
          text: `❌ ${errorMessage}. Por favor intenta de nuevo.`,
          timestamp: new Date(),
        },
      ]);

      setError({
        message:
          errorMessage ||
          "Error al conectar con el servidor. Por favor intenta de nuevo.",
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-surface to-surface/80">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-orange/10 to-teal/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-text-primary">Asistente IA Pet Quotes</h3>
            <p className="text-xs text-text-secondary">Disponible 24/7</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Cerrar chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={cn(
                "max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed",
                msg.type === "user"
                  ? "bg-orange text-white rounded-br-none"
                  : msg.type === "error"
                    ? "bg-red-500/10 text-red-700 border border-red-500/30 rounded-bl-none flex items-start gap-2"
                    : "bg-surface-secondary text-text-primary border border-border/30 rounded-bl-none"
              )}
            >
              {msg.type === "error" && <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
              <span>{msg.text}</span>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-surface-secondary border border-border/30 rounded-bl-none rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader className="animate-spin text-orange" size={18} />
              <span className="text-sm text-text-secondary">El asistente está escribiendo...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 text-red-700 text-xs flex items-start gap-2"
        >
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error.message}</span>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/30 bg-surface/50 backdrop-blur-sm flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null); // Limpiar error al escribir
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !loading) {
              handleSendMessage();
            }
          }}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
          className="flex-1 px-3 py-2 bg-surface border border-border/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          className={cn(
            "px-3 py-2 bg-orange rounded-lg text-white font-medium transition-all",
            loading || !input.trim()
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange/90 active:scale-95"
          )}
          aria-label="Enviar mensaje"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

// Importar motion si no está disponible
import { motion } from "framer-motion";
import { X } from "lucide-react";
