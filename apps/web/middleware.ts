import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { AuthRole, decodeJwtPayload, isJwtExpired } from "@/lib/auth-jwt";

const ROUTE_ROLE_RULES: Array<{ prefix: string; roles: AuthRole[] }> = [
  { prefix: "/bookings", roles: ["CLIENT", "VETERINARY", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] }
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = ROUTE_ROLE_RULES.find((entry) => pathname.startsWith(entry.prefix));

  if (!rule) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(accessToken);
  if (isJwtExpired(payload)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!payload.role || !rule.roles.includes(payload.role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/admin/:path*"]
};
