import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { MetricsController } from "./metrics.controller";
import { AppointmentsModule } from "./appointments/appointments.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AppointmentsModule],
  controllers: [HealthController, MetricsController]
})
export class AppModule {}
