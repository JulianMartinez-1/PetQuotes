const ACCESS_COOKIE = "pq_access_token";
const REFRESH_COOKIE = "pq_refresh_token";

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  writeCookie(ACCESS_COOKIE, accessToken, 60 * 15);
  writeCookie(REFRESH_COOKIE, refreshToken, 60 * 60 * 24 * 7);
}

export function clearAuthCookies() {
  document.cookie = `${ACCESS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${REFRESH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const AUTH_COOKIE_NAMES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE
};
