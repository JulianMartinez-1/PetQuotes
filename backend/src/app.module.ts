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
import { ClinicsModule } from '@presentation/clinics/clinics.module';
import { AppointmentsModule } from '@presentation/appointments/appointments.module';
import { AnalyticsModule } from '@presentation/analytics/analytics.module';
import { NotificationsModule } from '@presentation/notifications/notifications.module';
import { AdminModule } from '@presentation/admin/admin.module';
import { VeterinaryModule } from '@presentation/veterinary/veterinary.module';
import { ContactModule } from '@presentation/contact/contact.module';

// TODO: New modules - pending schema alignment
// import { ProfessionalModule } from '@presentation/professionals/professionals.module';

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
    ClinicsModule,
    AppointmentsModule,
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
    VeterinaryModule,
    ContactModule,
    // TODO: Add new modules after implementing with correct schema fields
    // ProfessionalModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
