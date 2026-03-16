import { Controller, Get, Header } from "@nestjs/common";
import { metricsStore } from "./metrics.store";

@Controller()
export class MetricsController {
  @Get("metrics")
  getMetrics() {
    return metricsStore.snapshot();
  }

  @Get("metrics/prometheus")
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  getPrometheusMetrics() {
    const snapshot = metricsStore.snapshot();
    const lines: string[] = [];

    lines.push("# HELP petquotes_http_requests_total Total HTTP requests handled");
    lines.push("# TYPE petquotes_http_requests_total counter");
    lines.push("# HELP petquotes_http_errors_total Total HTTP requests with error status (>= 400)");
    lines.push("# TYPE petquotes_http_errors_total counter");
    lines.push("# HELP petquotes_http_duration_avg_ms Average request latency by endpoint in milliseconds");
    lines.push("# TYPE petquotes_http_duration_avg_ms gauge");
    lines.push("# HELP petquotes_http_duration_max_ms Maximum request latency by endpoint in milliseconds");
    lines.push("# TYPE petquotes_http_duration_max_ms gauge");
    lines.push("# HELP petquotes_http_status_total Total HTTP responses grouped by status code");
    lines.push("# TYPE petquotes_http_status_total counter");

    for (const endpoint of snapshot.endpoints) {
      const baseLabels = `service=\"${escapeLabel(snapshot.service)}\",method=\"${escapeLabel(endpoint.method)}\",endpoint=\"${escapeLabel(endpoint.endpoint)}\"`;
      lines.push(`petquotes_http_requests_total{${baseLabels}} ${endpoint.requests}`);
      lines.push(`petquotes_http_errors_total{${baseLabels}} ${endpoint.errors}`);
      lines.push(`petquotes_http_duration_avg_ms{${baseLabels}} ${endpoint.avgDurationMs}`);
      lines.push(`petquotes_http_duration_max_ms{${baseLabels}} ${endpoint.maxDurationMs}`);

      for (const [status, count] of Object.entries(endpoint.statusCounts)) {
        lines.push(`petquotes_http_status_total{${baseLabels},status=\"${escapeLabel(status)}\"} ${count}`);
      }
    }

    return `${lines.join("\n")}\n`;
  }
}

function escapeLabel(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\"/g, '\\\"').replace(/\n/g, "\\n");
}
