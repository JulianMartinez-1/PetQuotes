import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { AuthService } from '@business/auth/auth.service';
import { OAuthService } from '@business/auth/oauth.service';
import { UserRepository } from '@data/repositories/user.repository';
import { JwtManager } from '@config/auth/jwt.manager';
import { PrismaService } from '@shared/prisma/prisma.service';
import { NotificationsModule } from '@presentation/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, OAuthService, UserRepository, JwtManager, PrismaService, ConfigService],
  exports: [AuthService, OAuthService, JwtManager],
})
export class AuthModule {}
