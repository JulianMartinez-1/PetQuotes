import { NextRequest, NextResponse } from "next/server";
import { callAuthBackendRequest } from "@/lib/auth-server";

const OAUTH_STATE_COOKIE = "pq_oauth_state";

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

    // Store state in httpOnly cookie so we can validate it on the callback.
    // This prevents CSRF attacks on the OAuth flow.
    const result = NextResponse.json({ authorizationUrl: data.authorizationUrl });
    result.cookies.set(OAUTH_STATE_COOKIE, data.state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60, // 10 minutes — same TTL as the completionToken
    });
    return result;
  } catch (error) {
    console.error("OAuth start error:", error);
    return NextResponse.json({ error: "Failed to start OAuth flow" }, { status: 500 });
  }
}
