import { MetricsController } from "./metrics.controller";
import { metricsStore } from "./metrics.store";

describe("Auth MetricsController", () => {
  it("includes business metrics in prometheus output", () => {
    const controller = new MetricsController();
    const before = metricsStore.snapshot();
    const previous =
      before.businessMetrics.find(
        (metric) => metric.name === "auth_login_success" && metric.labels.role === "CLIENT"
      )?.value ?? 0;

    metricsStore.incrementBusinessMetric("auth-service", "auth_login_success", { role: "CLIENT" });

    const prometheus = controller.getPrometheusMetrics();
    expect(prometheus).toContain("petquotes_business_event_total");
    expect(prometheus).toContain('event="auth_login_success"');

    const after = metricsStore.snapshot();
    const current =
      after.businessMetrics.find(
        (metric) => metric.name === "auth_login_success" && metric.labels.role === "CLIENT"
      )?.value ?? 0;

    expect(current).toBeGreaterThan(previous);
  });
});
