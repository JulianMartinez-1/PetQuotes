export type AuthRole = "CLIENT" | "VETERINARY" | "ADMIN";

export type AuthJwtPayload = {
  sub?: string;
  email?: string;
  role?: AuthRole;
  exp?: number;
};

function toBase64Url(buffer: Uint8Array) {
  let binary = "";
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64(value: string) {
  if (typeof atob === "function") {
    return atob(value);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64").toString("utf8");
  }

  throw new Error("No base64 decoder available");
}

export function decodeJwtPayload(token: string): AuthJwtPayload {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = decodeBase64(normalized);
    return JSON.parse(decoded) as AuthJwtPayload;
  } catch {
    return {};
  }
}

export function isJwtExpired(payload: AuthJwtPayload) {
  if (!payload.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds;
}

export async function verifyJwtHs256(token: string, secret: string): Promise<AuthJwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    const computedSignature = toBase64Url(new Uint8Array(signatureBuffer));

    if (computedSignature !== encodedSignature) {
      return null;
    }

    const payload = decodeJwtPayload(token);
    if (isJwtExpired(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
