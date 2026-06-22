import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from '@/business/appointments/appointments.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { NotificationsModule } from '@/presentation/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
