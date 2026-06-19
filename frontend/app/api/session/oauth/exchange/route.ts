import { NextRequest, NextResponse } from "next/server";
import { callAuthBackendRequest, getErrorPayload } from "@/lib/auth-server";
import { normalizeApiErrorMessage } from "@/lib/error-copy";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    provider?: string;
    code?: string;
    state?: string;
    redirectUri?: string;
  };

  if (!body.provider || !body.code || !body.state || !body.redirectUri) {
    return NextResponse.json({ message: "Faltan datos para completar autenticacion social" }, { status: 400 });
  }

  let backendResponse: Response;

  try {
    backendResponse = await callAuthBackendRequest(`/api/auth/oauth/${body.provider}/exchange`, {
      method: "POST",
      body: {
        code: body.code,
        state: body.state,
        redirectUri: body.redirectUri
      }
    });
  } catch {
    return NextResponse.json({ message: normalizeApiErrorMessage(504, "upstream timeout") }, { status: 504 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  // Exchange returns completion token (not login yet)
  const data = await backendResponse.json();
  return NextResponse.json(data);
}
