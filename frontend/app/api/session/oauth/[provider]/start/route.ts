import { NextRequest, NextResponse } from "next/server";
import { callAuthBackendRequest } from "@/lib/auth-server";

const OAUTH_STATE_COOKIE = "pq_oauth_state";
const OAUTH_PROVIDER_COOKIE = "pq_oauth_provider";

const cookieBase = (maxAge: number) => ({
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const callbackUri = `${request.nextUrl.origin}/oauth/callback`;
  const query = new URLSearchParams({ redirectUri: callbackUri }).toString();

  try {
    const backendResponse = await callAuthBackendRequest(`/api/auth/oauth/${provider}/start?${query}`, { method: "GET" });
    if (!backendResponse.ok) {
      return NextResponse.redirect(new URL("/login?oauthError=provider", request.url));
    }

    const payload = (await backendResponse.json()) as { authorizationUrl?: string; state?: string };
    if (!payload.authorizationUrl || !payload.state) {
      return NextResponse.redirect(new URL("/login?oauthError=config", request.url));
    }

    const redirectResponse = NextResponse.redirect(payload.authorizationUrl);
    // httpOnly: state is only read server-side in the exchange route
    redirectResponse.cookies.set(OAUTH_STATE_COOKIE, payload.state, { ...cookieBase(10 * 60), httpOnly: true });
    // NOT httpOnly: the callback page reads this via document.cookie to identify the provider
    redirectResponse.cookies.set(OAUTH_PROVIDER_COOKIE, provider, { ...cookieBase(10 * 60), httpOnly: false });
    return redirectResponse;
  } catch {
    return NextResponse.redirect(new URL("/login?oauthError=unavailable", request.url));
  }
}
