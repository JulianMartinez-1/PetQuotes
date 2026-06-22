import { Module } from '@nestjs/common';
import { NotificationService } from '@/business/notifications/notification.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
