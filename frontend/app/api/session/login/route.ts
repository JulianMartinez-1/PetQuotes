import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload, normalizeSessionResponse, setSessionCookies } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";
import { setCsrfCookie } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const body = await request.json();
  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackend("/auth/login", body);
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  const auth = await backendResponse.json();
  const response = NextResponse.json(normalizeSessionResponse(auth));
  setSessionCookies(response, auth);
  setCsrfCookie(response);
  return response;
}
