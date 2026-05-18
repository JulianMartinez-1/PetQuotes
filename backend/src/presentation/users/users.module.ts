import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from '@business/users/users.service';
import { UserRepository } from '@data/repositories/user.repository';
import { PrismaService } from '@shared/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserService],
})
export class UsersModule {}
