import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";

export async function POST(request: NextRequest) {
  const body = await request.json();
  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackend("/auth/forgot-password", body);
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  const payload = await backendResponse.json();
  return NextResponse.json(payload);
}
