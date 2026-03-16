import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  async getHealth() {
    await this.assertDatabaseReady();

    return {
      status: "ok",
      service: "auth-service",
      database: "up",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  }

  @Get("ready")
  async getReady() {
    await this.assertDatabaseReady();

    return {
      status: "ready",
      service: "auth-service",
      dependencies: {
        database: "up"
      },
      timestamp: new Date().toISOString()
    };
  }

  private async assertDatabaseReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: "degraded",
        service: "auth-service",
        database: "unavailable"
      });
    }
  }
}
