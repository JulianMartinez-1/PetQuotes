import { MetricsController } from "./metrics.controller";
import { metricsStore } from "./metrics.store";

describe("Appointment MetricsController", () => {
  it("exports appointment business events in prometheus format", () => {
    const controller = new MetricsController();
    const before = metricsStore.snapshot();
    const previous =
      before.businessMetrics.find(
        (metric) => metric.name === "booking_created" && metric.labels.serviceId === "service-consulta"
      )?.value ?? 0;

    metricsStore.incrementBusinessMetric("appointment-service", "booking_created", {
      role: "CLIENT",
      branchId: "branch-norte",
      serviceId: "service-consulta"
    });

    const prometheus = controller.getPrometheusMetrics();
    expect(prometheus).toContain("petquotes_business_event_total");
    expect(prometheus).toContain('event="booking_created"');
    expect(prometheus).toContain('serviceId="service-consulta"');

    const after = metricsStore.snapshot();
    const current =
      after.businessMetrics.find(
        (metric) => metric.name === "booking_created" && metric.labels.serviceId === "service-consulta"
      )?.value ?? 0;

    expect(current).toBeGreaterThan(previous);
  });
});
