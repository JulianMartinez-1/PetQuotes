import { NextRequest, NextResponse } from "next/server";
import { callAuthBackendRequest } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const redirectUri = request.nextUrl.searchParams.get("redirectUri");

  if (!provider) {
    return NextResponse.json(
      { error: "Provider is required" },
      { status: 400 }
    );
  }

  const callbackRedirectUri = redirectUri || `${request.nextUrl.origin}/oauth/callback`;

  try {
    const response = await callAuthBackendRequest(
      `/api/auth/oauth/${provider}/start?redirectUri=${encodeURIComponent(callbackRedirectUri)}`,
      { method: "GET" }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate OAuth URL" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("OAuth start error:", error);
    return NextResponse.json(
      { error: "Failed to start OAuth flow" },
      { status: 500 }
    );
  }
}
