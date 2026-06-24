import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { NotificationsModule } from '@presentation/notifications/notifications.module';

@Module({
  imports: [ConfigModule, NotificationsModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}
