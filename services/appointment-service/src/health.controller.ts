import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import Redis from "ioredis";
import { PrismaService } from "./prisma.service";

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  async getHealth() {
    await this.assertDependenciesReady();

    return {
      status: "ok",
      service: "appointment-service",
      database: "up",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  }

  @Get("ready")
  async getReady() {
    await this.assertDependenciesReady();

    return {
      status: "ready",
      service: "appointment-service",
      dependencies: {
        database: "up",
        redis: "up"
      },
      timestamp: new Date().toISOString()
    };
  }

  private async assertDependenciesReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: "degraded",
        service: "appointment-service",
        database: "unavailable"
      });
    }

    const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false
    });

    try {
      await redis.connect();
      const pong = await redis.ping();
      if (pong !== "PONG") {
        throw new Error("Unexpected redis ping response");
      }
    } catch {
      throw new ServiceUnavailableException({
        status: "degraded",
        service: "appointment-service",
        redis: "unavailable"
      });
    } finally {
      redis.disconnect();
    }
  }
}
