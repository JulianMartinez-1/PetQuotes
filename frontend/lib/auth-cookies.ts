export const AUTH_COOKIE_NAMES = {
  access: "pq_access_token",
  refresh: "pq_refresh_token"
};

export const AUTH_COOKIE_TTL = {
  accessSeconds: 60 * 15,
  refreshSeconds: 60 * 60 * 24 * 7
};

export function getAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge
  };
}
