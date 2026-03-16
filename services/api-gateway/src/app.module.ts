import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { MetricsController } from "./metrics.controller";
import { ProxyController } from "./proxy.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [ProxyController, HealthController, MetricsController]
})
export class AppModule {}
