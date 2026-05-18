import { NextResponse } from "next/server";
import { callAuthBackendRequest, getErrorPayload } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";

export async function GET() {
  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackendRequest("/auth/oauth/providers", { method: "GET" });
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  return NextResponse.json(await backendResponse.json());
}
