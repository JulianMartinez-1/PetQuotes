const FALLBACK_GENERIC = "No pudimos completar tu solicitud en este momento.";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload) return undefined;

  if (typeof payload === "string") {
    return payload.trim() || undefined;
  }

  const record = asRecord(payload);
  if (!record) return undefined;

  const directKeys = ["message", "error", "detail", "title", "description"];
  for (const key of directKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const message = record.message;
  if (Array.isArray(message)) {
    const firstText = message.find((item) => typeof item === "string" && item.trim());
    if (typeof firstText === "string") {
      return firstText.trim();
    }
  }

  return undefined;
}

export function parseErrorPayload(rawBody: string): unknown {
  const trimmed = rawBody.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

export function normalizeApiErrorMessage(status: number, rawMessage?: string): string {
  const message = (rawMessage ?? "").trim();
  const lower = message.toLowerCase();

  if (status === 401 || lower.includes("missing access token") || lower.includes("token") || lower.includes("unauthorized")) {
    return "Tu sesion vencio. Inicia sesion nuevamente para continuar.";
  }

  if (status === 403 || lower.includes("forbidden")) {
    return "No tienes permisos para realizar esta accion.";
  }

  if (status === 404) {
    return "No encontramos la informacion solicitada.";
  }

  if (status === 409) {
    return "Esta accion no pudo completarse porque la informacion cambio. Actualiza e intenta de nuevo.";
  }

  if (status === 422 || (status === 400 && (lower.includes("validation") || lower.includes("invalid") || lower.includes("required")))) {
    return "Revisa los datos ingresados y vuelve a intentarlo.";
  }

  if (status === 429) {
    return "Estamos recibiendo muchas solicitudes. Intenta nuevamente en unos segundos.";
  }

  if (status >= 500) {
    return "Estamos teniendo un problema temporal para procesar tu solicitud. Intenta nuevamente.";
  }

  if (lower.includes("failed to fetch") || lower.includes("network") || lower.includes("fetch")) {
    return "No pudimos conectarnos al servicio. Verifica tu conexion e intenta nuevamente.";
  }

  return message || FALLBACK_GENERIC;
}
