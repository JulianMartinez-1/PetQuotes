import { Controller, Post, Body, Module } from "@nestjs/common";

@Controller("notifications")
class NotificationController {
  @Post("email")
  sendEmail(@Body() payload: { to: string; subject: string; body: string }) {
    return { queued: true, channel: "email", payload };
  }
}

@Module({
  controllers: [NotificationController]
})
export class AppModule {}