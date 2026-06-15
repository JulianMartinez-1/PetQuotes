import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Pet } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { EntityNotFoundException } from '@shared/exceptions';

export interface CreatePetInput {
  ownerId: string;
  name?: string;
  species: string;
  breed?: string;
  age?: string;
  birthDate?: Date;
  weight?: number;
  microchip?: string;
  vaccinesUpToDate?: boolean;
  bloodType?: string;
  notes?: string;
  profileImage?: string;
}

export interface UpdatePetInput {
  name?: string;
  breed?: string;
  age?: string;
  birthDate?: Date;
  weight?: number;
  microchip?: string;
  vaccinesUpToDate?: boolean;
  bloodType?: string;
  notes?: string;
  profileImage?: string;
}

@Injectable()
export class PetRepository extends BaseRepository<Pet, CreatePetInput, UpdatePetInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Pet | null> {
    return this.prisma.pet.findUnique({
      where: { id },
    });
  }

  async findByOwner(ownerId: string, params?: any): Promise<Pet[]> {
    return this.prisma.pet.findMany({
      where: { ownerId },
      ...params,
    });
  }

  async findMany(args: any): Promise<Pet[]> {
    return this.prisma.pet.findMany(args);
  }

  async count(): Promise<number> {
    return this.prisma.pet.count();
  }

  async create(data: CreatePetInput): Promise<Pet> {
    return this.prisma.pet.create({
      data: {
        id: `pet_${Date.now()}`,
        ownerId: data.ownerId,
        name: data.name,
        species: data.species,
        breed: data.breed,
        age: data.age,
        birthDate: data.birthDate,
        weight: data.weight,
        microchip: data.microchip,
        vaccinesUpToDate: data.vaccinesUpToDate || false,
        bloodType: data.bloodType,
        notes: data.notes,
        profileImage: data.profileImage,
      },
    });
  }

  async update(id: string, data: UpdatePetInput): Promise<Pet> {
    const pet = await this.findById(id);
    if (!pet) throw new EntityNotFoundException('Pet', id);

    return this.prisma.pet.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Pet> {
    const pet = await this.findById(id);
    if (!pet) throw new EntityNotFoundException('Pet', id);

    return this.prisma.pet.delete({
      where: { id },
    });
  }

  async findByMicrochip(microchip: string): Promise<Pet | null> {
    return this.prisma.pet.findUnique({
      where: { microchip },
    });
  }

  async countByOwner(ownerId: string): Promise<number> {
    return this.prisma.pet.count({
      where: { ownerId },
    });
  }
}
