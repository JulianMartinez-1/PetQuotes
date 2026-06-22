import { extractErrorMessage, normalizeApiErrorMessage, parseErrorPayload } from "@/lib/error-copy";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf-shared";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 10_000);

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  retryOn401?: boolean;
  timeoutMs?: number;
};

function isSessionRoute(path: string) {
  return path.startsWith("/api/session/");
}

function isInternalRoute(path: string) {
  return path.startsWith("/api/session/") || path.startsWith("/api/proxy/");
}

function isMutationMethod(method?: string) {
  if (!method) return false;
  const normalized = method.toUpperCase();
  return normalized === "POST" || normalized === "PUT" || normalized === "PATCH" || normalized === "DELETE";
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const pairs = document.cookie.split(";");
  for (const pair of pairs) {
    const [rawKey, ...rest] = pair.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return undefined;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = isInternalRoute(normalizedPath) ? new URL(normalizedPath, "http://localhost") : new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return isInternalRoute(normalizedPath) ? `${url.pathname}${url.search}` : url.toString();
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, headers, retryOn401 = true, timeoutMs, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const effectiveTimeout = timeoutMs ?? REQUEST_TIMEOUT_MS;

  const requestHeaders = new Headers(headers ?? {});
  requestHeaders.set("Content-Type", "application/json");

  if (isInternalRoute(normalizedPath) && isMutationMethod(rest.method)) {
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (csrfToken) {
      requestHeaders.set(CSRF_HEADER_NAME, csrfToken);
    }
  }

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), effectiveTimeout);

  try {
    response = await fetch(buildUrl(normalizedPath, query), {
      ...rest,
      credentials: "include",
      headers: requestHeaders,
      signal: controller.signal
    });
  } catch {
    throw new Error(normalizeApiErrorMessage(0, "network", normalizedPath));
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 && retryOn401 && !isSessionRoute(normalizedPath)) {
    const refreshHeaders = new Headers();
    const refreshCsrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (refreshCsrfToken) {
      refreshHeaders.set(CSRF_HEADER_NAME, refreshCsrfToken);
    }

    const refreshResponse = await fetch("/api/session/refresh", {
      method: "POST",
      credentials: "include",
      headers: refreshHeaders
    });

    if (refreshResponse.ok) {
      const retryController = new AbortController();
      const retryTimeout = setTimeout(() => retryController.abort(), effectiveTimeout);
      try {
        response = await fetch(buildUrl(normalizedPath, query), {
          ...rest,
          credentials: "include",
          headers: requestHeaders,
          signal: retryController.signal
        });
      } catch {
        throw new Error(normalizeApiErrorMessage(0, "network"));
      } finally {
        clearTimeout(retryTimeout);
      }
    }
  }

  if (!response.ok) {
    const body = await response.text();
    const payload = parseErrorPayload(body);
    const rawMessage = extractErrorMessage(payload);
    throw new Error(normalizeApiErrorMessage(response.status, rawMessage, normalizedPath));
  }

  return response.json() as Promise<T>;
}
