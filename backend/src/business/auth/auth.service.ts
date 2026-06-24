import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { UserRepository } from '@data/repositories/user.repository';
import { JwtManager } from '@config/auth/jwt.manager';
import { PrismaService } from '@shared/prisma/prisma.service';
import { NotificationService } from '@business/notifications/notification.service';
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
  veterinaryStatus?: string;
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
    private notificationService: NotificationService,
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

    let user: Awaited<ReturnType<typeof this.userRepository.create>>;

    if (role === 'VETERINARY' && options.veterinaryType) {
      user = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: { email, passwordHash, fullName, role },
        });
        await this._createVeterinaryProfileTx(tx, createdUser.id, options);
        return createdUser;
      });
      this._notifyAdminOfNewVeterinaryRequest(
        { fullName: user.fullName, email: user.email },
        options,
      ).catch(() => {});
    } else {
      user = await this.userRepository.create({ email, passwordHash, fullName, role });
    }

    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role, user.fullName);
    const veterinaryStatus = role === 'VETERINARY' ? await this._getVeterinaryStatus(user.id) : undefined;
    return { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, veterinaryStatus, ...tokens };
  }

  private async _createVeterinaryProfileTx(
    tx: Prisma.TransactionClient,
    userId: string,
    options: RegisterOptions,
  ): Promise<void> {
    const { veterinaryType, clinicData, independentData } = options;

    if (veterinaryType === 'CLINIC' && clinicData) {
      const clinic = await tx.clinic.create({
        data: {
          ownerUserId: userId,
          name: clinicData.clinicName,
          description: clinicData.description?.trim() || null,
          phone: clinicData.phone?.trim() || null,
          licenseNumber: clinicData.licenseNumber?.trim() || null,
        },
      });

      await tx.branch.create({
        data: {
          clinicId: clinic.id,
          name: clinicData.clinicName,
          city: clinicData.city,
          address: clinicData.address,
          phone: clinicData.phone?.trim() || null,
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
  }

  private async _notifyAdminOfNewVeterinaryRequest(
    user: { fullName: string; email: string },
    options: RegisterOptions,
  ): Promise<void> {
    const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) return;

    await this.prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'VETERINARY_APPROVAL_REQUEST',
        title: 'Nueva solicitud veterinaria pendiente',
        message: `${user.fullName} (${user.email}) solicitó registrar su ${options.veterinaryType === 'CLINIC' ? 'clínica' : 'perfil de veterinario independiente'}.`,
        data: JSON.stringify({
          applicantName: user.fullName,
          applicantEmail: user.email,
          veterinaryType: options.veterinaryType,
          clinicName: options.clinicData?.clinicName,
          serviceArea: options.independentData?.serviceArea,
        }),
      },
    });

    await this.notificationService.sendVeterinaryApprovalRequest({
      to: admin.email,
      adminName: admin.fullName,
      applicantName: user.fullName,
      applicantEmail: user.email,
      veterinaryType: options.veterinaryType!,
      clinicName: options.clinicData?.clinicName,
      serviceArea: options.independentData?.serviceArea,
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
    const veterinaryStatus = user.role === 'VETERINARY' ? await this._getVeterinaryStatus(user.id) : undefined;
    return { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, veterinaryStatus, ...tokens };
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
    const veterinaryStatus = user.role === 'VETERINARY' ? await this._getVeterinaryStatus(user.id) : undefined;
    return { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, veterinaryStatus, ...tokens };
  }

  private async _getVeterinaryStatus(userId: string): Promise<string | undefined> {
    const profile = await this.prisma.veterinaryProfile.findUnique({
      where: { userId },
      select: { status: true },
    });
    return profile?.status ?? undefined;
  }
}
