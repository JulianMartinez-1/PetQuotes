import { NextRequest, NextResponse } from "next/server";
import { callAuthBackendRequest, getErrorPayload } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";

export async function GET(request: NextRequest) {
  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackendRequest("/api/auth/oauth/providers", { method: "GET" });
  } catch (error) {
    console.error("[OAuth Providers] Backend request failed:", error);
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    const errorMessage = await getErrorPayload(backendResponse);
    console.error("[OAuth Providers] Backend error:", backendResponse.status, errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: backendResponse.status });
  }

  const data = await backendResponse.json();
  return NextResponse.json(data);
}
