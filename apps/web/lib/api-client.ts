export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  retryOn401?: boolean;
};

function isSessionRoute(path: string) {
  return path.startsWith("/api/session/");
}

function isInternalRoute(path: string) {
  return path.startsWith("/api/session/") || path.startsWith("/api/proxy/");
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
  const { query, headers, retryOn401 = true, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(headers ?? {})
  };

  let response = await fetch(buildUrl(normalizedPath, query), {
    ...rest,
    credentials: "include",
    headers: requestHeaders
  });

  if (response.status === 401 && retryOn401 && !isSessionRoute(normalizedPath)) {
    const refreshResponse = await fetch("/api/session/refresh", {
      method: "POST",
      credentials: "include"
    });

    if (refreshResponse.ok) {
      response = await fetch(buildUrl(normalizedPath, query), {
        ...rest,
        credentials: "include",
        headers: requestHeaders
      });
    }
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
