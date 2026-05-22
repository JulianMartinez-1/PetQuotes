import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Shared
import { PrismaService } from '@shared/prisma/prisma.service';

// Modules
import { AuthModule } from '@presentation/auth/auth.module';
import { UsersModule } from '@presentation/users/users.module';
import { PetsModule } from '@presentation/pets/pets.module';
import { HealthModule } from '@presentation/health/health.module';
import { VaccineModule } from '@presentation/vaccines/vaccine.module';
import { MedicationModule } from '@presentation/medications/medication.module';

// TODO: New modules - pending schema alignment
// import { ClinicModule } from '@presentation/clinics/clinics.module';
// import { AppointmentModule } from '@presentation/appointments/appointments.module';
// import { ProfessionalModule } from '@presentation/professionals/professionals.module';
// import { NotificationModule } from '@presentation/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    // Feature modules
    AuthModule,
    UsersModule,
    PetsModule,
    HealthModule,
    VaccineModule,
    MedicationModule,
    // TODO: Add new modules after implementing with correct schema fields
    // ClinicModule,
    // AppointmentModule,
    // ProfessionalModule,
    // NotificationModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
