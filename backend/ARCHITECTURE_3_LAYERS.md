# Arquitectura de 3 Capas - Pet Quotes Backend

## 📋 Descripción General

El backend de Pet Quotes ha sido migrado a una **arquitectura de 3 capas** (Three-Layer Architecture), consolidando 8 microservicios en una aplicación monolítica unificada con NestJS y Prisma ORM.

## 🏗️ Estructura de Capas

### 1. **Capa de Presentación (Presentation Layer)** 
**Ubicación:** `backend/src/presentation/`

Responsabilidades:
- Manejo de HTTP (Controllers)
- Validación de entrada con DTOs
- Gestión de autorización y autenticación
- Transformación de datos para respuestas HTTP

Componentes:
```
presentation/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.dto.ts
├── users/
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.dto.ts
├── pets/
│   ├── pets.controller.ts
│   ├── pets.module.ts
│   └── pets.dto.ts
├── clinics/
│   ├── clinics.controller.ts
│   ├── clinics.module.ts
│   └── clinics.dto.ts
├── appointments/
│   ├── appointments.controller.ts
│   ├── appointments.module.ts
│   └── appointments.dto.ts
├── professionals/
│   ├── professionals.controller.ts
│   ├── professionals.module.ts
│   └── professionals.dto.ts
├── notifications/
│   ├── notifications.controller.ts
│   ├── notifications.module.ts
│   └── notifications.dto.ts
└── health/
    ├── health.controller.ts
    └── health.module.ts
```

### 2. **Capa de Negocio (Business Layer)**
**Ubicación:** `backend/src/business/`

Responsabilidades:
- Lógica de negocio central
- Validaciones de reglas de negocio
- Orquestación entre capas
- Gestión de errores de negocio

Componentes:
```
business/
├── auth/
│   └── auth.service.ts
├── users/
│   └── users.service.ts
├── pets/
│   └── pets.service.ts
├── clinics/
│   └── clinics.service.ts
├── appointments/
│   └── appointments.service.ts
├── professionals/
│   └── professionals.service.ts
└── notifications/
    └── notifications.service.ts
```

### 3. **Capa de Datos (Data Layer)**
**Ubicación:** `backend/src/data/`

Responsabilidades:
- Acceso a base de datos
- Operaciones CRUD
- Consultas complejas
- Mapeo de entidades

Componentes:
```
data/
├── repositories/
│   ├── base.repository.ts
│   ├── user.repository.ts
│   ├── pet.repository.ts
│   ├── clinic.repository.ts
│   ├── appointment.repository.ts
│   ├── professional.repository.ts
│   └── notification.repository.ts
├── entities/
├── migrations/
└── index.ts
```

## 🔄 Flujo de Datos

```
HTTP Request
    ↓
[Presentation Layer]
├─ Controller recibe request
├─ DTO valida entrada
├─ Guard valida JWT
└─ Delega al servicio
    ↓
[Business Layer]
├─ Service contiene lógica
├─ Validaciones de negocio
├─ Transformaciones
└─ Delega al repository
    ↓
[Data Layer]
├─ Repository accede a BD
├─ Operación CRUD
├─ Retorna datos
└─ Service transforma resultado
    ↓
[Presentation Layer]
├─ Controller formatea respuesta
├─ DTO estructura salida
└─ Retorna HTTP Response
```

## 📦 Módulos Implementados

### ✅ Completamente Implementados

1. **Auth Module**
   - Registro y login
   - Tokens JWT (Access + Refresh)
   - Lockout por intentos fallidos
   - Renovación de tokens

2. **Users Module**
   - CRUD de usuarios
   - Perfil de usuario
   - Actualización de perfil
   - Gestión de roles (CLIENT, VETERINARY, ADMIN)

3. **Pets Module**
   - CRUD de mascotas
   - Historial médico
   - Relación con propietarios

4. **Clinics Module** ✨ *Nuevo*
   - CRUD de clínicas
   - Gestión de sucursales
   - Información de contacto

5. **Appointments Module** ✨ *Nuevo*
   - Creación de citas
   - Confirmación/cancelación
   - Historial de citas por usuario/mascota/clínica

6. **Professionals Module** ✨ *Nuevo*
   - Registro de veterinarios
   - Gestión de especialidades
   - Asignación a clínicas

7. **Notifications Module** ✨ *Nuevo*
   - Creación de notificaciones
   - Marcar como leído
   - Eliminar notificaciones leídas
   - Contador de no leídas

8. **Health Module**
   - Verificación de salud de la aplicación
   - Estado de BD y servicios

## 🛡️ Seguridad por Capa

### Presentation Layer
- JWT Authentication Guard
- Roles Authorization Guard
- Rate limiting (10 req/60s)
- DTO Validation

### Business Layer
- Validaciones de reglas de negocio
- Manejo de excepciones personalizadas
- Sanitización de datos sensibles

### Data Layer
- Queries parameterizadas (Prisma)
- Encapsulación de lógica SQL
- Control de acceso a entidades

## 🔌 Dependencias Entre Capas

```
Presentation Layer
    ↓ (inyecta)
Business Layer
    ↓ (inyecta)
Data Layer
    ↓ (usa)
Prisma ORM → PostgreSQL
```

## 📚 DTOs (Data Transfer Objects)

Cada módulo de presentación incluye DTOs para:
- **CreateXxxDto**: Validación de entrada para creación
- **UpdateXxxDto**: Validación de entrada para actualización
- **XxxResponseDto**: Formato de salida estandarizado

Ejemplo:
```typescript
// Input
CreateClinicDto {
  name: string
  address: string
  phone?: string
  email?: string
}

// Output
ClinicResponseDto {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  createdAt: Date
  updatedAt: Date
}
```

## 🗂️ Rutas API

### Authentication
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token

### Users
- `GET /api/users/me` - Perfil actual
- `PATCH /api/users/me` - Actualizar perfil

### Pets
- `GET /api/pets` - Listar mascotas
- `POST /api/pets` - Crear mascota
- `GET /api/pets/:id` - Obtener mascota
- `PATCH /api/pets/:id` - Actualizar mascota
- `DELETE /api/pets/:id` - Eliminar mascota

### Clinics
- `GET /api/clinics` - Listar clínicas
- `POST /api/clinics` - Crear clínica (Admin)
- `GET /api/clinics/:id` - Obtener clínica
- `PATCH /api/clinics/:id` - Actualizar clínica (Admin)
- `DELETE /api/clinics/:id` - Eliminar clínica (Admin)

### Appointments
- `GET /api/appointments` - Listar mis citas
- `POST /api/appointments` - Crear cita
- `GET /api/appointments/:id` - Obtener cita
- `PATCH /api/appointments/:id` - Actualizar cita
- `POST /api/appointments/:id/confirm` - Confirmar cita
- `POST /api/appointments/:id/cancel` - Cancelar cita
- `DELETE /api/appointments/:id` - Eliminar cita

### Professionals
- `GET /api/professionals` - Listar profesionales
- `POST /api/professionals` - Crear profesional (Admin)
- `GET /api/professionals/:id` - Obtener profesional
- `PATCH /api/professionals/:id` - Actualizar profesional (Admin)
- `POST /api/professionals/:id/specialties` - Agregar especialidad (Admin)
- `DELETE /api/professionals/:id/specialties/:specialtyId` - Eliminar especialidad (Admin)

### Notifications
- `GET /api/notifications` - Listar mis notificaciones
- `GET /api/notifications/unread/count` - Contar no leídas
- `POST /api/notifications` - Crear notificación
- `PATCH /api/notifications/:id` - Actualizar notificación
- `POST /api/notifications/:id/read` - Marcar como leída
- `POST /api/notifications/mark-all-read` - Marcar todas como leídas

## 🧪 Patrón de Testing

Cada capa puede testearse independientemente:

```typescript
// Test de Repository (Data Layer)
describe('UserRepository', () => {
  it('should find user by email', async () => {
    const user = await repository.findByEmail('test@example.com');
    expect(user).toBeDefined();
  });
});

// Test de Service (Business Layer)
describe('UserService', () => {
  it('should throw error if user not found', async () => {
    await expect(service.getProfile('invalid-id')).rejects.toThrow();
  });
});

// Test de Controller (Presentation Layer)
describe('UsersController', () => {
  it('should return user profile', async () => {
    const result = await controller.getMyProfile(mockJwtPayload);
    expect(result).toHaveProperty('id');
  });
});
```

## 📈 Beneficios de la Arquitectura

✅ **Separación de Responsabilidades**: Cada capa tiene un propósito claro
✅ **Mantenibilidad**: Fácil localizar y modificar lógica
✅ **Testabilidad**: Cada capa puede testearse aisladamente
✅ **Reutilización**: Los servicios pueden usarse desde diferentes controllers
✅ **Escalabilidad**: Fácil agregar nuevos módulos siguiendo el patrón
✅ **Seguridad**: Control granular en cada capa

## 🚀 Próximas Mejoras

- [ ] Implementar caché en capa de datos
- [ ] Agregar eventos de dominio en capa de negocio
- [ ] Implementar patrón CQRS (Query/Command)
- [ ] Agregar validadores custom de negocio
- [ ] Implementar Soft Deletes
- [ ] Agregar Auditoría de cambios
