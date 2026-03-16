import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Controller()
export class HealthController {
  constructor(private readonly http: HttpService) {}

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      service: "api-gateway",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      dependencies: {
        authServiceConfigured: Boolean(process.env.AUTH_SERVICE_URL),
        appointmentServiceConfigured: Boolean(process.env.APPOINTMENT_SERVICE_URL)
      }
    };
  }

  @Get("ready")
  async getReady() {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL;

    if (!authServiceUrl || !appointmentServiceUrl) {
      throw new ServiceUnavailableException({
        status: "degraded",
        service: "api-gateway",
        reason: "upstream services not configured"
      });
    }

    let authHealthy = false;
    let appointmentHealthy = false;

    try {
      await firstValueFrom(this.http.get(`${authServiceUrl}/health`, { timeout: 2000 }));
      authHealthy = true;
    } catch {
      authHealthy = false;
    }

    try {
      await firstValueFrom(this.http.get(`${appointmentServiceUrl}/health`, { timeout: 2000 }));
      appointmentHealthy = true;
    } catch {
      appointmentHealthy = false;
    }

    if (!authHealthy || !appointmentHealthy) {
      throw new ServiceUnavailableException({
        status: "degraded",
        service: "api-gateway",
        dependencies: {
          authService: authHealthy ? "up" : "down",
          appointmentService: appointmentHealthy ? "up" : "down"
        }
      });
    }

    return {
      status: "ready",
      service: "api-gateway",
      dependencies: {
        authService: "up",
        appointmentService: "up"
      },
      timestamp: new Date().toISOString()
    };
  }
}
