import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";
import { JwtAccessGuard } from "../jwt-access.guard";
import { RolesGuard } from "../roles.guard";

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService, JwtAccessGuard, RolesGuard],
  exports: [PrismaService]
})
export class AppointmentsModule {}
