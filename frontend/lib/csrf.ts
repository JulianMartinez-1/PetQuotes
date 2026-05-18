import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf-shared";

function csrfCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };
}

export function setCsrfCookie(response: NextResponse) {
  const token = randomBytes(24).toString("hex");
  response.cookies.set(CSRF_COOKIE_NAME, token, csrfCookieOptions());
  return token;
}

export function clearCsrfCookie(response: NextResponse) {
  response.cookies.set(CSRF_COOKIE_NAME, "", { ...csrfCookieOptions(), maxAge: 0 });
}

export function assertDoubleSubmitCsrf(request: NextRequest) {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return false;
  }

  return true;
}
