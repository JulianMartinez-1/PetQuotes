import { Module } from '@nestjs/common';
import { VaccineController } from './vaccine.controller';
import { VaccineService } from '@business/vaccines/vaccine.service';
import { VaccineRepository } from '@data/repositories/vaccine.repository';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [VaccineController],
  providers: [VaccineService, VaccineRepository, PrismaService],
  exports: [VaccineService],
})
export class VaccineModule {}
