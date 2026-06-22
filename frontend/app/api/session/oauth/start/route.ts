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

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const redirectUri = request.nextUrl.searchParams.get("redirectUri");

  if (!provider) {
    return NextResponse.json({ error: "Provider is required" }, { status: 400 });
  }

  const callbackRedirectUri = redirectUri || `${request.nextUrl.origin}/oauth/callback`;

  try {
    const response = await callAuthBackendRequest(
      `/api/auth/oauth/${provider}/start?redirectUri=${encodeURIComponent(callbackRedirectUri)}`,
      { method: "GET" }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to generate OAuth URL" }, { status: response.status });
    }

    const data = (await response.json()) as { authorizationUrl: string; state: string };

    const result = NextResponse.json({ authorizationUrl: data.authorizationUrl });
    // httpOnly: state is only read server-side in the exchange route
    result.cookies.set(OAUTH_STATE_COOKIE, data.state, { ...cookieBase(10 * 60), httpOnly: true });
    // NOT httpOnly: the callback page reads this via document.cookie to identify the provider
    result.cookies.set(OAUTH_PROVIDER_COOKIE, provider, { ...cookieBase(10 * 60), httpOnly: false });
    return result;
  } catch (error) {
    console.error("OAuth start error:", error);
    return NextResponse.json({ error: "Failed to start OAuth flow" }, { status: 500 });
  }
}
