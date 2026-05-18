import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '@data/repositories/user.repository';
import { JwtManager } from '@config/auth/jwt.manager';
import {
  InvalidCredentialsException,
  DuplicateEntityException,
  AccountLockedException,
  EntityNotFoundException,
} from '@shared/exceptions';

export interface LoginResult {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterResult extends LoginResult {}

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private userRepository: UserRepository,
    private jwtManager: JwtManager,
  ) {}

  /**
   * Register a new user
   */
  async register(email: string, password: string, fullName: string): Promise<RegisterResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DuplicateEntityException('User', 'email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userRepository.create({
      email,
      passwordHash,
      fullName,
      role: 'CLIENT',
    });

    // Generate tokens
    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role);

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Check if account is locked
    const isLocked = await this.userRepository.isAccountLocked(user.id);
    if (isLocked) {
      throw new AccountLockedException(user.lockedUntil!);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const newAttempts = user.failedLoginAttempts + 1;

      if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + this.LOCK_TIME_MS);
        await this.userRepository.lockAccount(user.id, lockedUntil);
        throw new AccountLockedException(lockedUntil);
      }

      await this.userRepository.updateFailedLoginAttempts(user.id, newAttempts);
      throw new InvalidCredentialsException();
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.userRepository.updateFailedLoginAttempts(user.id, 0);
    }

    // Generate tokens
    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role);

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      ...tokens,
    };
  }

  /**
   * Verify and decode token
   */
  async verifyToken(token: string) {
    try {
      return this.jwtManager.verifyToken(token);
    } catch (error) {
      throw new InvalidCredentialsException();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(userId: string): Promise<LoginResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role);

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      ...tokens,
    };
  }
}
