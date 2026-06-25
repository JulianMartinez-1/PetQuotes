import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { NotificationsModule } from '@presentation/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ContactController],
})
export class ContactModule {}
