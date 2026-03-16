import { randomUUID } from "crypto";
import { metricsStore } from "./metrics.store";

type RequestLike = {
  method: string;
  baseUrl?: string;
  originalUrl?: string;
  url: string;
  route?: { path?: string };
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
};

type ResponseLike = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  on: (event: "finish", listener: () => void) => void;
};

export function observabilityMiddleware(service: string) {
  return (req: RequestLike, res: ResponseLike, next: () => void) => {
    const startedAt = Date.now();
    const incomingRequestId = req.headers["x-request-id"];
    const requestId =
      typeof incomingRequestId === "string" && incomingRequestId.trim().length > 0
        ? incomingRequestId
        : randomUUID();

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      const endpoint = normalizeEndpoint(req);
      metricsStore.record(service, req.method, endpoint, res.statusCode, durationMs);

      console.log(
        JSON.stringify({
          level: "info",
          service,
          event: "http_request",
          requestId,
          method: req.method,
          path: req.originalUrl ?? req.url,
          statusCode: res.statusCode,
          durationMs,
          ip: req.ip ?? "unknown",
          timestamp: new Date().toISOString()
        })
      );
    });

    next();
  };
}

function normalizeEndpoint(req: RequestLike) {
  if (req.route?.path) {
    return `${req.baseUrl ?? ""}${req.route.path}`;
  }
  const rawPath = req.originalUrl ?? req.url;
  return rawPath.split("?")[0];
}
