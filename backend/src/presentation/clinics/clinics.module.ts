import { Module } from '@nestjs/common';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';
import { ClinicsWithFallbackService } from './clinics-fallback.service';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService, ClinicsWithFallbackService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
