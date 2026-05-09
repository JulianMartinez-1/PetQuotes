import { NextRequest, NextResponse } from "next/server";
import { callAuthBackendRequest } from "@/lib/auth-server";

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const callbackUri = `${request.nextUrl.origin}/oauth/callback?provider=${encodeURIComponent(provider)}`;
  const query = new URLSearchParams({ redirectUri: callbackUri }).toString();

  try {
    const backendResponse = await callAuthBackendRequest(`/auth/oauth/${provider}/start?${query}`, { method: "GET" });
    if (!backendResponse.ok) {
      return NextResponse.redirect(new URL("/login?oauthError=provider", request.url));
    }

    const payload = (await backendResponse.json()) as { authorizationUrl?: string };
    if (!payload.authorizationUrl) {
      return NextResponse.redirect(new URL("/login?oauthError=config", request.url));
    }

    return NextResponse.redirect(payload.authorizationUrl);
  } catch {
    return NextResponse.redirect(new URL("/login?oauthError=unavailable", request.url));
  }
}
