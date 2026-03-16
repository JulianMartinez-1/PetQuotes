type EndpointMetric = {
  method: string;
  endpoint: string;
  requests: number;
  errors: number;
  totalDurationMs: number;
  maxDurationMs: number;
  statusCounts: Record<string, number>;
};

type MetricsSnapshot = {
  service: string;
  generatedAt: string;
  totals: {
    requests: number;
    errors: number;
  };
  endpoints: Array<
    EndpointMetric & {
      avgDurationMs: number;
    }
  >;
};

class MetricsStore {
  private readonly endpointMetrics = new Map<string, EndpointMetric>();
  private lastServiceName = "unknown-service";

  record(service: string, method: string, endpoint: string, statusCode: number, durationMs: number) {
    const key = `${method} ${endpoint}`;
    const existing =
      this.endpointMetrics.get(key) ??
      {
        method,
        endpoint,
        requests: 0,
        errors: 0,
        totalDurationMs: 0,
        maxDurationMs: 0,
        statusCounts: {}
      };

    existing.requests += 1;
    existing.totalDurationMs += durationMs;
    existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
    if (statusCode >= 400) {
      existing.errors += 1;
    }
    const statusKey = String(statusCode);
    existing.statusCounts[statusKey] = (existing.statusCounts[statusKey] ?? 0) + 1;

    this.endpointMetrics.set(key, existing);
    this.lastServiceName = service;
  }

  snapshot(): MetricsSnapshot {
    const endpoints = Array.from(this.endpointMetrics.values()).map((metric) => ({
      ...metric,
      avgDurationMs: Number((metric.totalDurationMs / Math.max(metric.requests, 1)).toFixed(2))
    }));

    const totals = endpoints.reduce(
      (acc, endpoint) => {
        acc.requests += endpoint.requests;
        acc.errors += endpoint.errors;
        return acc;
      },
      { requests: 0, errors: 0 }
    );

    return {
      service: this.lastServiceName,
      generatedAt: new Date().toISOString(),
      totals,
      endpoints
    };
  }
}

export const metricsStore = new MetricsStore();
