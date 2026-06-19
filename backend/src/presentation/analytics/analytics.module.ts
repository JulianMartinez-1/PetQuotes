import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '@business/analytics/analytics.service';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService, ConfigService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
