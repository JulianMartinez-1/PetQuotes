import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        timeout: Number(config.get('SERVICE_HTTP_TIMEOUT_MS') ?? 15000),
        maxRedirects: 0,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
