import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '@data/repositories/user.repository';
import { JwtManager } from '@config/auth/jwt.manager';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  InvalidCredentialsException,
  DuplicateEntityException,
  AccountLockedException,
  EntityNotFoundException,
} from '@shared/exceptions';
import { VeterinaryClinicDataDto, VeterinaryIndependentDataDto } from '@presentation/auth/auth.dto';

export interface LoginResult {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterResult extends LoginResult {}

export interface RegisterOptions {
  role?: 'CLIENT' | 'VETERINARY';
  veterinaryType?: 'CLINIC' | 'INDEPENDENT';
  clinicData?: VeterinaryClinicDataDto;
  independentData?: VeterinaryIndependentDataDto;
}

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MS = 15 * 60 * 1000;

  constructor(
    private userRepository: UserRepository,
    private jwtManager: JwtManager,
    private prisma: PrismaService,
  ) {}

  async register(
    email: string,
    password: string,
    fullName: string,
    options: RegisterOptions = {},
  ): Promise<RegisterResult> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DuplicateEntityException('User', 'email');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = options.role === 'VETERINARY' ? 'VETERINARY' : 'CLIENT';

    const user = await this.userRepository.create({ email, passwordHash, fullName, role });

    if (role === 'VETERINARY' && options.veterinaryType) {
      await this._createVeterinaryProfile(user.id, options);
    }

    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role, user.fullName);
    return { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, ...tokens };
  }

  private async _createVeterinaryProfile(userId: string, options: RegisterOptions): Promise<void> {
    const { veterinaryType, clinicData, independentData } = options;

    await this.prisma.$transaction(async (tx) => {
      if (veterinaryType === 'CLINIC' && clinicData) {
        const clinic = await tx.clinic.create({
          data: {
            ownerUserId: userId,
            name: clinicData.clinicName,
            description: clinicData.description ?? null,
            phone: clinicData.phone ?? null,
            licenseNumber: clinicData.licenseNumber ?? null,
          },
        });

        await tx.branch.create({
          data: {
            clinicId: clinic.id,
            name: clinicData.clinicName,
            city: clinicData.city,
            address: clinicData.address,
            phone: clinicData.phone ?? null,
            latitude: clinicData.latitude,
            longitude: clinicData.longitude,
          },
        });

        if (clinicData.services && clinicData.services.length > 0) {
          await tx.veterinaryService.createMany({
            data: clinicData.services.map((category) => ({
              clinicId: clinic.id,
              name: category,
              category,
              price: 0,
              duration: 30,
            })),
          });
        }

        await tx.veterinaryProfile.create({
          data: { userId, veterinaryType: 'CLINIC', clinicId: clinic.id },
        });
      } else if (veterinaryType === 'INDEPENDENT' && independentData) {
        await tx.veterinaryProfile.create({
          data: {
            userId,
            veterinaryType: 'INDEPENDENT',
            serviceArea: independentData.serviceArea,
            homeVisits: independentData.homeVisits,
            coverageRadius: independentData.coverageRadius ?? null,
          },
        });
      }
    });
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isLocked = await this.userRepository.isAccountLocked(user.id);
    if (isLocked) {
      throw new AccountLockedException(user.lockedUntil!);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;

      if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + this.LOCK_TIME_MS);
        await this.userRepository.lockAccount(user.id, lockedUntil);
        throw new AccountLockedException(lockedUntil);
      }

      await this.userRepository.updateFailedLoginAttempts(user.id, newAttempts);
      throw new InvalidCredentialsException();
    }

    if (user.failedLoginAttempts > 0) {
      await this.userRepository.updateFailedLoginAttempts(user.id, 0);
    }

    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role, user.fullName);
    return { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, ...tokens };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtManager.verifyToken(token);
    } catch {
      throw new InvalidCredentialsException();
    }
  }

  async refreshToken(userId: string): Promise<LoginResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role, user.fullName);
    return { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, ...tokens };
  }
}
