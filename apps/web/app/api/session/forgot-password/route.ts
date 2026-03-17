import { NextRequest, NextResponse } from "next/server";
import { callAuthBackend, getErrorPayload } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendResponse = await callAuthBackend("/auth/forgot-password", body);

  if (!backendResponse.ok) {
    return NextResponse.json({ message: await getErrorPayload(backendResponse) }, { status: backendResponse.status });
  }

  const payload = await backendResponse.json();
  return NextResponse.json(payload);
}
