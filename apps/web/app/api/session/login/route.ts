import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendResponse = await callAuthBackend("/auth/login", body);

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  const auth = await backendResponse.json();
  const response = NextResponse.json(normalizeSessionResponse(auth));
  setSessionCookies(response, auth);
  return response;
}
