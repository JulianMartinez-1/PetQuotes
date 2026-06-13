import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access);
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refresh);

  console.log("[Debug Cookies]", {
    timestamp: new Date().toISOString(),
    allCookies: allCookies.map(c => ({ name: c.name, valueLength: c.value.length })),
    accessTokenPresent: !!accessToken,
    refreshTokenPresent: !!refreshToken,
    accessTokenValue: accessToken?.value?.substring(0, 30) + "...",
    requestHeaders: {
      cookie: request.headers.get("cookie"),
    }
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    cookies: {
      allCookies: allCookies.length,
      cookieList: allCookies.map(c => `${c.name} (${c.value.length} bytes)`),
      accessToken: {
        present: !!accessToken,
        value: accessToken?.value?.substring(0, 50) + "..."
      },
      refreshToken: {
        present: !!refreshToken,
        value: refreshToken?.value?.substring(0, 50) + "..."
      }
    },
    headers: {
      cookie: request.headers.get("cookie")
    }
  });
}
