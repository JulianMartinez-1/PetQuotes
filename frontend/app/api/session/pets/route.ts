import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth-cookies";
import { extractErrorMessage, normalizeApiErrorMessage, parseErrorPayload } from "@/lib/error-copy";
import { fetchWithTimeout } from "@/lib/server-fetch";

const API_GATEWAY_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  console.log("[GET /api/session/pets] Access token present:", !!accessToken);
  
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  let upstream: Response;
  
  const fullUrl = `${API_GATEWAY_URL}/api/pets${queryString}`;
  console.log("[GET /api/session/pets] Calling:", fullUrl);

  try {
    upstream = await fetchWithTimeout(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    }, timeoutMs);
    console.log("[GET /api/session/pets] Backend response status:", upstream.status);
  } catch (error) {
    console.error("[GET /api/session/pets] Fetch error:", error);
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
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  console.log("[POST /api/session/pets] Access token present:", !!accessToken);
  
  if (!accessToken) {
    return NextResponse.json({ message: normalizeApiErrorMessage(401, "missing access token") }, { status: 401 });
  }

  const timeoutMs = Number(process.env.API_PROXY_TIMEOUT_MS ?? 8000);
  let upstream: Response;
  
  const fullUrl = `${API_GATEWAY_URL}/api/pets`;
  
  try {
    // Clone the request to get the body as-is, preserving multipart boundary
    const clonedRequest = request.clone();
    const body = await clonedRequest.blob();
    const contentType = request.headers.get("content-type");
    
    console.log("[POST /api/session/pets] Body size:", body.size);
    console.log("[POST /api/session/pets] Content-Type from request:", contentType);
    
    upstream = await fetchWithTimeout(fullUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        ...(contentType ? { "Content-Type": contentType } : {})
      },
      body: body,
      cache: "no-store"
    }, timeoutMs);
    console.log("[POST /api/session/pets] Backend response status:", upstream.status);
  } catch (error) {
    console.error("[POST /api/session/pets] Fetch error:", error);
    return NextResponse.json(
      { message: normalizeApiErrorMessage(504, "upstream timeout") },
      { status: 504 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    console.error("[POST /api/session/pets] Backend error response:", text);
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
      "Content-Type": "application/json",
    },
  });
}