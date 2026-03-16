import { Controller, Get, Module } from "@nestjs/common";

@Controller("schedule")
class ScheduleController {
  @Get("availability")
  availability() {
    return [
      { professionalId: "pro-1", day: "monday", from: "08:00", to: "16:00" },
      { professionalId: "pro-2", day: "tuesday", from: "10:00", to: "18:00" }
    ];
  }
}

@Module({
  controllers: [ScheduleController]
})
export class AppModule {}