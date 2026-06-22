import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { extractErrorMessage, normalizeApiErrorMessage, parseErrorPayload } from "@/lib/error-copy";
import { fetchWithTimeout } from "@/lib/server-fetch";
import { assertDoubleSubmitCsrf } from "@/lib/csrf";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }

  const { id: petId } = await params;
  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  let upstream: Response;

  try {
    upstream = await fetchWithTimeout(`${API_GATEWAY_URL}/api/pets/${petId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    }, timeoutMs);
  } catch {
    return NextResponse.json(
      { message: normalizeApiErrorMessage(504, "upstream timeout") },
      { status: 504 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    const payload = parseErrorPayload(text);
    const rawMessage = extractErrorMessage(payload);
    return NextResponse.json(
      { message: normalizeApiErrorMessage(upstream.status, rawMessage) },
      { status: upstream.status }
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json"
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!assertDoubleSubmitCsrf(request)) {
    return NextResponse.json({ message: "No se pudo validar la solicitud. Recarga la pagina e intenta de nuevo." }, { status: 403 });
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }

  const { id: petId } = await params;
  const contentType = request.headers.get("content-type") ?? "";
  const idempotencyKey = request.headers.get("x-idempotency-key") ?? undefined;

  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  let upstream: Response;

  try {
    let body: any;

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = await request.json();
    }

    upstream = await fetchWithTimeout(`${API_GATEWAY_URL}/api/pets/${petId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {}),
        ...(contentType.includes("multipart/form-data") ? {} : { "Content-Type": "application/json" })
      },
      body: contentType.includes("multipart/form-data") ? body : JSON.stringify(body),
      cache: "no-store"
    }, timeoutMs);
  } catch {
    return NextResponse.json(
      { message: normalizeApiErrorMessage(504, "upstream timeout") },
      { status: 504 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    const payload = parseErrorPayload(text);
    const rawMessage = extractErrorMessage(payload);
    return NextResponse.json(
      { message: normalizeApiErrorMessage(upstream.status, rawMessage) },
      { status: upstream.status }
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json"
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!assertDoubleSubmitCsrf(request)) {
    return NextResponse.json({ message: "No se pudo validar la solicitud. Recarga la pagina e intenta de nuevo." }, { status: 403 });
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }

  const { id: petId } = await params;
  const idempotencyKey = request.headers.get("x-idempotency-key") ?? undefined;

  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  let upstream: Response;

  try {
    upstream = await fetchWithTimeout(`${API_GATEWAY_URL}/api/pets/${petId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {})
      },
      cache: "no-store"
    }, timeoutMs);
  } catch {
    return NextResponse.json(
      { message: normalizeApiErrorMessage(504, "upstream timeout") },
      { status: 504 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    const payload = parseErrorPayload(text);
    const rawMessage = extractErrorMessage(payload);
    return NextResponse.json(
      { message: normalizeApiErrorMessage(upstream.status, rawMessage) },
      { status: upstream.status }
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json"
    }
  });
}
