import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";

const PROTECTED_PREFIXES = ["/bookings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (accessToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/bookings/:path*"]
};
