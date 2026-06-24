import { Module } from '@nestjs/common';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';
import { ClinicsWithFallbackService } from './clinics-fallback.service';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService, ClinicsWithFallbackService, PrismaService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
