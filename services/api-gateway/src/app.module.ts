import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { MetricsController } from "./metrics.controller";
import { ProxyController } from "./proxy.controller";
import { OllamaController } from "./ollama/ollama.controller";
import { OllamaService } from "./ollama/ollama.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [ProxyController, HealthController, MetricsController, OllamaController],
  providers: [OllamaService]
})
export class AppModule {}
