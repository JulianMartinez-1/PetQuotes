import { Injectable } from '@nestjs/common';
import { PetRepository, CreatePetInput, UpdatePetInput } from '@data/repositories/pet.repository';
import { EntityNotFoundException, UnauthorizedOperationException } from '@shared/exceptions';

@Injectable()
export class PetsService {
  constructor(private petRepository: PetRepository) {}

  /**
   * List all pets of a user
   */
  async listMyPets(userId: string, page = 1, limit = 10) {
    const result = await this.petRepository.findAll({ page, limit });
    const userPets = await this.petRepository.findByOwner(userId);

    return {
      items: userPets,
      total: userPets.length,
      page,
      limit,
      pages: Math.ceil(userPets.length / limit),
    };
  }

  /**
   * Get pet by ID
   */
  async getPetById(petId: string, userId?: string) {
    const pet = await this.petRepository.findById(petId);
    if (!pet) {
      throw new EntityNotFoundException('Pet', petId);
    }

    // Check ownership if userId is provided
    if (userId && pet.ownerId !== userId) {
      throw new UnauthorizedOperationException('You do not own this pet');
    }

    return pet;
  }

  /**
   * Create a new pet
   */
  async createPet(userId: string, data: CreatePetInput) {
    return this.petRepository.create({
      ...data,
      ownerId: userId,
    });
  }

  /**
   * Update pet
   */
  async updatePet(petId: string, userId: string, data: UpdatePetInput) {
    const pet = await this.getPetById(petId, userId);
    return this.petRepository.update(petId, data);
  }

  /**
   * Delete pet
   */
  async deletePet(petId: string, userId: string) {
    const pet = await this.getPetById(petId, userId);
    return this.petRepository.delete(petId);
  }

  /**
   * Count user's pets
   */
  async countMyPets(userId: string) {
    return this.petRepository.countByOwner(userId);
  }

  /**
   * Find pet by microchip
   */
  async findByMicrochip(microchip: string) {
    return this.petRepository.findByMicrochip(microchip);
  }
}
