export type AuthRole = "CLIENT" | "VETERINARY" | "ADMIN";

export type AuthJwtPayload = {
  sub?: string;
  email?: string;
  role?: AuthRole;
  exp?: number;
};

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
