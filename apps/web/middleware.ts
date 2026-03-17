import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { verifyJwtHs256 } from "@/lib/auth-jwt";
import { ROUTE_ROLE_POLICY } from "@/lib/route-policy";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = ROUTE_ROLE_POLICY.find((entry) => pathname.startsWith(entry.prefix));

  if (!rule) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyJwtHs256(accessToken, jwtSecret);
  if (!payload) {
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
