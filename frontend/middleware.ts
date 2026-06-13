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
  
  console.log(`[Middleware] Ruta protegida: ${pathname}`);
  console.log(`[Middleware] Cookie presente: ${!!accessToken}`);
  
  // Si no hay token, permitir acceso pero dejar que el cliente se encargue
  // El AuthGuard del lado del cliente redirigirá si es necesario
  if (!accessToken) {
    console.log(`[Middleware] ⚠️ Sin access token en ${pathname}, pero permitiendo acceso al cliente`);
    return NextResponse.next();
  }

  // Verificar que el token es válido
  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret) {
    console.log("[Middleware] JWT_ACCESS_SECRET no configurado");
    return NextResponse.next();
  }

  const payload = await verifyJwtHs256(accessToken, jwtSecret);
  if (!payload) {
    console.log("[Middleware] Token JWT inválido, pero permitiendo acceso al cliente");
    return NextResponse.next();
  }

  // Verificar rol si es necesario
  if (!payload.role || !rule.roles.includes(payload.role)) {
    console.log(`[Middleware] Rol no autorizado: ${payload.role}, redirigiendo a inicio`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log(`[Middleware] ✅ Acceso permitido para ${pathname}, rol: ${payload.role}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/profile/:path*", "/activity/:path*", "/admin/:path*"]
};
