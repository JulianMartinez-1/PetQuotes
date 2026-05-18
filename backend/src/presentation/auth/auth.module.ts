import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from '@business/auth/auth.service';
import { UserRepository } from '@data/repositories/user.repository';
import { JwtManager } from '@config/auth/jwt.manager';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtManager, PrismaService, ConfigService],
  exports: [AuthService, JwtManager],
})
export class AuthModule {}
