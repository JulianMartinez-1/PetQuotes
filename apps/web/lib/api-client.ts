export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

let inMemoryAccessToken: string | null = null;

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  retryOn401?: boolean;
};

type RefreshSessionResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: "CLIENT" | "VETERINARY" | "ADMIN";
  };
};

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

function isSessionRoute(path: string) {
  return path.startsWith("/api/session/");
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = isSessionRoute(normalizedPath) ? new URL(normalizedPath, "http://localhost") : new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return isSessionRoute(normalizedPath) ? `${url.pathname}${url.search}` : url.toString();
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, headers, retryOn401 = true, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined)
  };

  if (!isSessionRoute(normalizedPath) && inMemoryAccessToken && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${inMemoryAccessToken}`;
  }

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
      const refreshPayload = (await refreshResponse.json()) as RefreshSessionResponse;
      setAccessToken(refreshPayload.accessToken);

      response = await fetch(buildUrl(normalizedPath, query), {
        ...rest,
        credentials: "include",
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${refreshPayload.accessToken}`
        }
      });
    }
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
