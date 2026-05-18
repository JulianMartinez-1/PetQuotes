import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { User } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { EntityNotFoundException } from '@shared/exceptions';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: 'CLIENT' | 'VETERINARY' | 'ADMIN';
}

export interface UpdateUserInput {
  fullName?: string;
  phone?: string;
  profileImage?: string;
}

@Injectable()
export class UserRepository extends BaseRepository<User, CreateUserInput, UpdateUserInput> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findMany(args: any): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: data.role || 'CLIENT',
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new EntityNotFoundException('User', id);

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new EntityNotFoundException('User', id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateFailedLoginAttempts(userId: string, attempts: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: attempts },
    });
  }

  async lockAccount(userId: string, lockedUntil: Date): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lockedUntil },
    });
  }

  async unlockAccount(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
      },
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;
    if (!user.lockedUntil) return false;
    return user.lockedUntil > new Date();
  }
}
