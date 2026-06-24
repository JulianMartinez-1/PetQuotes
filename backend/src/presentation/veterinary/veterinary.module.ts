import { Module } from '@nestjs/common';
import { VeterinaryController } from './veterinary.controller';
import { VeterinaryService } from './veterinary.service';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [VeterinaryController],
  providers: [VeterinaryService, PrismaService],
})
export class VeterinaryModule {}
