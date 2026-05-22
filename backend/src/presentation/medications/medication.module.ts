import { Module } from '@nestjs/common';
import { MedicationController } from './medication.controller';
import { MedicationService } from '@business/medications/medication.service';
import { MedicationRepository } from '@data/repositories/medication.repository';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [MedicationController],
  providers: [MedicationService, MedicationRepository, PrismaService],
  exports: [MedicationService],
})
export class MedicationModule {}
