import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { verifyJwtHs256 } from "@/lib/auth-jwt";
import { ROUTE_ROLE_POLICY } from "@/lib/route-policy";

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = ROUTE_ROLE_POLICY.find((entry) => pathname.startsWith(entry.prefix));

  if (!rule) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;

  if (!accessToken) {
    // If there is a refresh token, the client still has a valid session —
    // let the page load so AuthStateProvider can renew the access token on mount.
    const hasRefreshToken = !!request.cookies.get(AUTH_COOKIE_NAMES.refresh)?.value;
    if (hasRefreshToken) {
      return NextResponse.next();
    }
    return redirectToLogin(request, pathname);
  }

  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret) {
    // Secret not configured — fail open only in dev to avoid breaking local setup.
    // In production this should be a hard error, so log clearly.
    console.error("[Middleware] JWT_ACCESS_SECRET is not set — server-side auth is disabled");
    return NextResponse.next();
  }

  const payload = await verifyJwtHs256(accessToken, jwtSecret);
  if (!payload) {
    // Expired or tampered token — send to login so the client can refresh
    return redirectToLogin(request, pathname);
  }

  if (!payload.role || !rule.roles.includes(payload.role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/profile/:path*", "/admin/:path*"]
};
