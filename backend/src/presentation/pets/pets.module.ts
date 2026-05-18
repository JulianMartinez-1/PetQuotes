import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from '@business/pets/pets.service';
import { PetRepository } from '@data/repositories/pet.repository';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService, PetRepository, PrismaService],
  exports: [PetsService],
})
export class PetsModule {}
