# New Modules Implementation Guide

**Status**: ✅ Backend compiles successfully  
**Date Created**: 2026-05-17

Este documento proporciona exactamente lo que se necesita para implementar correctamente los 4 módulos nuevos (Clinics, Appointments, Professionals, Notifications) en el backend NestJS.

---

## Estructura de Archivos Necesaria

Para cada módulo nuevo, crear la siguiente estructura:

```
backend/src/
├── data/repositories/[module].repository.ts
├── business/[module]/[module].service.ts
├── presentation/[module]/
│   ├── dtos.ts
│   ├── [module].controller.ts
│   └── [module].module.ts
```

---

## 1. Clinic Module

### Prisma Schema Fields (Actuales - CORRECTO)
```
id, ownerUserId, name, description, phone, email, website, 
licenseNumber, logo, rating, isVerified, createdAt, updatedAt
```

**IMPORTANTE**: Clinic NO tiene campo `isActive`. Si necesitas soft-delete, usar `isVerified = false`.

### Repository Implementation

```typescript
// clinic.repository.ts
import { Injectable } from '@nestjs/common';
import { Clinic } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';

export type CreateClinicInput = {
  ownerUserId: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  licenseNumber?: string;
  logo?: string;
};

export type UpdateClinicInput = {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  licenseNumber?: string;
  logo?: string;
  rating?: number;
  isVerified?: boolean;
};

@Injectable()
export class ClinicRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Clinic | null> { ... }
  async findByLicenseNumber(licenseNumber: string): Promise<Clinic | null> { ... }
  async findByOwnerId(ownerId: string): Promise<Clinic[]> { ... }
  async findMany(skip: number, take: number): Promise<Clinic[]> { ... }
  async create(data: CreateClinicInput): Promise<Clinic> { ... }
  async update(id: string, data: UpdateClinicInput): Promise<Clinic> { ... }
  async delete(id: string): Promise<boolean> { ... }
  async count(): Promise<number> { ... }
  async findByRating(minRating: number): Promise<Clinic[]> { ... }
  async updateRating(clinicId: string, rating: number): Promise<Clinic> { ... }
}
```

### Service Implementation
- Use `EntityNotFoundException` de `@shared/exceptions/entity-not-found.exception`
- Use `ValidationException` de `@shared/exceptions/validation.exception`
- Incluir validación: `licenseNumber` debe ser único
- Rating debe estar entre 0 y 5

### DTO Implementation
```typescript
export class CreateClinicDto {
  @IsString() @IsNotEmpty() ownerUserId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() licenseNumber?: string;
  @IsString() @IsOptional() logo?: string;
}

export class ClinicResponseDto {
  id: string; ownerUserId: string; name: string; description: string | null;
  email: string | null; phone: string | null; website: string | null;
  licenseNumber: string | null; logo: string | null; rating: number | null;
  isVerified: boolean; createdAt: Date; updatedAt: Date;
}

export class UpdateClinicDto {
  // Same as CreateClinicDto but all @IsOptional
}
```

### Controller Routes
- `GET /api/clinics` - list all
- `GET /api/clinics/count` - total count
- `GET /api/clinics/owner/:ownerId` - by owner
- `GET /api/clinics/:id` - by ID
- `POST /api/clinics` - create (ADMIN/VETERINARY)
- `PATCH /api/clinics/:id` - update (ADMIN/VETERINARY)
- `PATCH /api/clinics/:id/rating` - update rating (ADMIN/VETERINARY)
- `DELETE /api/clinics/:id` - delete (ADMIN)
- `POST /api/clinics/rating/search` - find by min rating

### Module
```typescript
@Module({
  providers: [ClinicService, ClinicRepository, PrismaService],
  controllers: [ClinicController],
  exports: [ClinicService],
})
export class ClinicModule {}
```

---

## 2. Appointment Module

### Prisma Schema Fields (Actuales - CORRECTO)
```
id, clientId, petId (REQUIRED - no optional), professionalId, serviceId, 
branchId, clinicId, status, startTime, endTime (nullable), notes, 
idempotencyKey, cancellationReason, createdAt, updatedAt
```

**IMPORTANTE**: `petId` es **OBLIGATORIO** en Prisma. No puede ser opcional.

### Repository Implementation

```typescript
export type CreateAppointmentInput = {
  clientId: string;
  petId: string;  // REQUIRED - NOT optional
  professionalId: string;
  serviceId: string;
  branchId: string;
  clinicId: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
};

export type UpdateAppointmentInput = {
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  status?: AppointmentStatus;
  cancellationReason?: string;
};
```

Methods needed:
- `findById(id)` - with all relations
- `findByClientId(userId, skip, take)`
- `findByProfessionalId(professionalId, skip, take)`
- `findByClinicId(clinicId, skip, take)`
- `findByBranchId(branchId, skip, take)`
- `findByPetId(petId, skip, take)`
- `findByStatus(status, skip, take)`
- `findByDateRange(startDate, endDate, skip, take)`
- `create(data)`, `update(id, data)`, `delete(id)`
- `findMany(skip, take)`, `countByClient(clientId)`, `countByProfessional(professionalId)`

### Service Implementation
- Validar que `startTime < endTime`
- Validar que `startTime > now()`
- Status values: PENDING | CONFIRMED | CANCELLED | RESCHEDULED | COMPLETED
- Methods: createAppointment, confirmAppointment, cancelAppointment, rescheduleAppointment, completeAppointment, etc.

### DTO Implementation
```typescript
export class CreateAppointmentDto {
  @IsString() @IsNotEmpty() clientId: string;
  @IsString() @IsNotEmpty() petId: string;  // REQUIRED
  @IsString() @IsNotEmpty() professionalId: string;
  @IsString() @IsNotEmpty() serviceId: string;
  @IsString() @IsNotEmpty() branchId: string;
  @IsString() @IsNotEmpty() clinicId: string;
  @IsDateString() @IsNotEmpty() startTime: string;
  @IsDateString() @IsNotEmpty() endTime: string;
  @IsString() @IsOptional() notes?: string;
}

export class AppointmentResponseDto {
  id: string; clientId: string; petId: string; professionalId: string;
  serviceId: string; branchId: string; clinicId: string; startTime: Date;
  endTime: Date | null; status: string; notes: string | null;
  cancellationReason: string | null; createdAt: Date; updatedAt: Date;
}
```

### Controller Routes
- `GET /api/appointments` - list all
- `GET /api/appointments/user/:userId` - user appointments
- `GET /api/appointments/professional/:professionalId` - professional schedule
- `GET /api/appointments/clinic/:clinicId` - clinic appointments
- `GET /api/appointments/branch/:branchId` - branch appointments
- `GET /api/appointments/pet/:petId` - pet history
- `GET /api/appointments/:id` - by ID
- `POST /api/appointments` - create
- `PATCH /api/appointments/:id` - update
- `POST /api/appointments/:id/confirm` - confirm (VETERINARY/ADMIN)
- `POST /api/appointments/:id/cancel` - cancel
- `POST /api/appointments/:id/reschedule` - reschedule
- `POST /api/appointments/:id/complete` - complete (VETERINARY/ADMIN)
- `DELETE /api/appointments/:id` - delete (ADMIN)
- `POST /api/appointments/date-range/search` - search by date range

---

## 3. Professional Module

### Prisma Schema Fields (Actuales - CORRECTO)
```
id, userId (UNIQUE), branchId, specialty, licenseNumber (UNIQUE, nullable), 
yearsOfExperience, bio, profileImage, isActive, createdAt, updatedAt
```

**IMPORTANTE**: `branchId` - NO `clinicId`. Professional está asociado con Branch, no directamente con Clinic.

### Repository Implementation

```typescript
export type CreateProfessionalInput = {
  userId: string;
  branchId: string;
  specialty: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  bio?: string;
  profileImage?: string;
};

export type UpdateProfessionalInput = {
  specialty?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  bio?: string;
  profileImage?: string;
  isActive?: boolean;
};
```

Methods:
- `findById(id)`, `findByUserId(userId)`, `findByBranchId(branchId)`
- `findBySpecialty(specialty, branchId?)`, `findByLicenseNumber(licenseNumber)`
- `create(data)`, `update(id, data)`, `delete(id)` (soft-delete with isActive=false)
- `findMany(skip, take, onlyActive)`, `countByBranch(branchId)`

### Service Implementation
- Validar specialty no está vacío
- Validar yearsOfExperience >= 0
- Validar licenseNumber único
- Usar soft-delete: `isActive = false`

### DTO Implementation
```typescript
export class CreateProfessionalDto {
  @IsString() @IsNotEmpty() userId: string;
  @IsString() @IsNotEmpty() branchId: string;  // NOT clinicId
  @IsString() @IsNotEmpty() specialty: string;
  @IsString() @IsOptional() licenseNumber?: string;
  @IsNumber() @Min(0) @IsOptional() yearsOfExperience?: number;
  @IsString() @IsOptional() bio?: string;
  @IsString() @IsOptional() profileImage?: string;
}

export class ProfessionalResponseDto {
  id: string; userId: string; branchId: string; specialty: string;
  licenseNumber: string | null; yearsOfExperience: number | null;
  bio: string | null; profileImage: string | null; isActive: boolean;
  createdAt: Date; updatedAt: Date;
}
```

---

## 4. Notification Module

### Prisma Schema Fields (Actuales - CORRECTO)
```
id, userId, type, title, message, data (nullable, JSON string), 
read, readAt (nullable), createdAt, updatedAt
```

**IMPORTANTE**: Campo es `read` (no `isRead`). NotificationType values:
- APPOINTMENT_CONFIRMED
- APPOINTMENT_CANCELLED
- APPOINTMENT_RESCHEDULED (no RESCHEDULE)
- APPOINTMENT_REMINDER
- MEDICAL_UPDATE (no MEDICAL_RESULT)
- SYSTEM_ALERT

### Repository Implementation

```typescript
export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string;
};

export type UpdateNotificationInput = {
  read?: boolean;
  readAt?: Date;
};
```

Methods:
- `findById(id)`, `findByUserId(userId, skip, take)`
- `findByUserIdAndStatus(userId, read, skip, take)` 
- `countUnread(userId)`
- `markAsRead(notificationId)`, `markAllAsRead(userId)`
- `create(data)`, `update(id, data)`, `delete(id)`
- `deleteRead(userId, daysOld)` - cleanup old read notifications
- `findMany(skip, take)`

### Service Implementation
- Al marcar como read: set `read: true` y `readAt: new Date()`
- Crear helper methods para notificaciones comunes (appointment confirmation, reminders, medical updates)

### DTO Implementation
```typescript
export class CreateNotificationDto {
  @IsString() @IsNotEmpty() userId: string;
  @IsEnum(['APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 
           'APPOINTMENT_REMINDER', 'MEDICAL_UPDATE', 'SYSTEM_ALERT'])
  @IsNotEmpty() type: NotificationType;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() message: string;
  @IsString() @IsOptional() data?: string;
}

export class NotificationResponseDto {
  id: string; userId: string; type: NotificationType; title: string;
  message: string; data: string | null; read: boolean; readAt: Date | null;
  createdAt: Date; updatedAt: Date;
}
```

---

## Implementation Checklist

### Before Starting
- [ ] Read this entire guide
- [ ] Understand the Prisma schema fields (review schema.prisma)
- [ ] Note the differences from original implementation assumptions

### For Each Module (Clinic, Appointment, Professional, Notification)

#### Phase 1: Data Layer
- [ ] Create `backend/src/data/repositories/[module].repository.ts`
- [ ] Extend BaseRepository with correct types
- [ ] Implement all query methods
- [ ] **DO NOT** use soft-delete on Appointment (it uses Restrict on relations)

#### Phase 2: Business Layer
- [ ] Create `backend/src/business/[module]/[module].service.ts`
- [ ] Import exceptions: `@shared/exceptions/entity-not-found.exception`
- [ ] Import exceptions: `@shared/exceptions/validation.exception`
- [ ] Implement all business logic with proper validation

#### Phase 3: Presentation Layer
- [ ] Create `backend/src/presentation/[module]/dtos.ts` with DTOs
- [ ] Create `backend/src/presentation/[module]/[module].controller.ts`
- [ ] Create `backend/src/presentation/[module]/[module].module.ts`
- [ ] Use correct imports:
  - `JwtAuthGuard` from `@shared/guards/jwt-auth.guard`
  - `CurrentUser` from `@shared/decorators`
  - `Roles` from `@shared/decorators`

#### Phase 4: Integration
- [ ] Update `backend/src/data/index.ts` - uncomment export
- [ ] Update `backend/src/business/index.ts` - uncomment export
- [ ] Update `backend/src/presentation/index.ts` - uncomment exports
- [ ] Update `backend/src/app.module.ts` - uncomment import and add to imports array

#### Phase 5: Validation
- [ ] Run `npm run build` in backend/
- [ ] Verify zero TypeScript errors
- [ ] Run `npm run start` to verify runtime
- [ ] Test API endpoints with Postman or curl

---

## Common Mistakes to Avoid

1. ❌ Using `clinicId` for Professional - use `branchId` instead
2. ❌ Using `isActive` for Clinic - use `isVerified` for soft-delete
3. ❌ Making `petId` optional in Appointment - it's REQUIRED in Prisma
4. ❌ Using `isRead` in Notification - it's `read`
5. ❌ Forgetting to import PrismaService in repository constructor
6. ❌ Wrong exception imports - use `@shared/exceptions/...`
7. ❌ Wrong decorator imports - use `@shared/decorators`
8. ❌ Using query parameters as strings without parsing - parse to number/boolean
9. ❌ NotificationType values - verify exact enum names (APPOINTMENT_RESCHEDULED not RESCHEDULE)

---

## Testing Commands

```bash
# Verify compilation
cd backend
npm run build

# Start development server
npm run start

# Test API (example)
curl -X POST http://localhost:3000/api/clinics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"ownerUserId":"user-id","name":"Clinic Name"}'
```

---

## References

- Prisma Schema: `backend/prisma/schema.prisma`
- Auth Module Example: `backend/src/presentation/auth/`
- Users Module Example: `backend/src/presentation/users/`
- Exception Types: `backend/src/shared/exceptions/`
- Guard/Decorator Usage: `backend/src/presentation/users/users.controller.ts`
