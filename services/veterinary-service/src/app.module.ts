import { Controller, Get, Module } from "@nestjs/common";

@Controller()
class HealthController {
  @Get("health")
  health() {
    return { service: "veterinary-service", status: "ok" };
  }
}

@Module({
  controllers: [HealthController]
})
export class AppModule {}