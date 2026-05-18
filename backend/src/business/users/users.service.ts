import { Injectable } from '@nestjs/common';
import { UserRepository, UpdateUserInput } from '@data/repositories/user.repository';
import { EntityNotFoundException } from '@shared/exceptions';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    const { passwordHash, failedLoginAttempts, lockedUntil, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateUserInput) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    const updated = await this.userRepository.update(userId, data);
    const { passwordHash, failedLoginAttempts, lockedUntil, ...safeUser } = updated;
    return safeUser;
  }

  /**
   * Get user by ID (with sanitized data)
   */
  async getUserById(userId: string) {
    return this.getProfile(userId);
  }

  /**
   * List users with pagination
   */
  async listUsers(page = 1, limit = 10) {
    const result = await this.userRepository.findAll({ page, limit });
    return {
      ...result,
      items: result.items.map(({ passwordHash, failedLoginAttempts, lockedUntil, ...safe }) => safe),
    };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new EntityNotFoundException('User', `email: ${email}`);
    }

    const { passwordHash, failedLoginAttempts, lockedUntil, ...safeUser } = user;
    return safeUser;
  }
}
