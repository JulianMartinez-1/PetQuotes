# Pet Quotes Backend

Backend de la plataforma Pet Quotes construido con **NestJS** siguiendo una **arquitectura de 3 capas**.

## 🏗️ Stack Tecnológico

- **NestJS 11** - Framework TypeScript para Node.js
- **PostgreSQL 16** - Base de datos relacional
- **Prisma ORM** - ORM moderno y type-safe
- **JWT** - Autenticación stateless
- **bcryptjs** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **Docker** - Containerización

## 📋 Requisitos

- Node.js 20+
- Docker & Docker Compose (opcional)
- PostgreSQL 16 (o usar Docker)

## 🚀 Instalación Rápida

### Con Docker Compose

```bash
# Desde la raíz del proyecto
npm run docker:up

# Ejecutar migraciones
npm run db:migrate:deploy
```

### Sin Docker (Desarrollo Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Editar .env con tu configuración
# DATABASE_URL="postgresql://pet_quotes:password@localhost:5432/pet_quotes_db"

# 4. Ejecutar migraciones
npm run prisma:migrate:dev

# 5. Iniciar servidor
npm run start:dev
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── presentation/                    # 🎯 HTTP Layer (Controllers)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.dto.ts
│   │   ├── users/
│   │   ├── pets/
│   │   ├── clinics/
│   │   ├── appointments/
│   │   ├── professionals/
│   │   ├── notifications/
│   │   ├── health/
│   │   └── index.ts
│   │
│   ├── business/                        # 💼 Business Logic (Services)
│   │   ├── auth/
│   │   │   └── auth.service.ts
│   │   ├── users/
│   │   ├── pets/
│   │   ├── clinics/
│   │   ├── appointments/
│   │   ├── professionals/
│   │   ├── notifications/
│   │   └── index.ts
│   │
│   ├── data/                            # 💾 Data Access (Repositories)
│   │   ├── repositories/
│   │   │   ├── base.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── pet.repository.ts
│   │   │   ├── clinic.repository.ts
│   │   │   ├── appointment.repository.ts
│   │   │   ├── professional.repository.ts
│   │   │   └── notification.repository.ts
│   │   ├── entities/
│   │   ├── migrations/
│   │   └── index.ts
│   │
│   ├── config/                          # ⚙️ Configuration
│   │   ├── auth/
│   │   │   └── jwt.manager.ts
│   │   ├── database/
│   │   │   └── database.config.ts
│   │   └── index.ts
│   │
│   └── shared/                          # 🔧 Shared Utilities
│       ├── dto/
│       │   └── common.dto.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   └── roles.guard.ts
│       ├── decorators/
│       │   └── index.ts
│       ├── exceptions/
│       │   └── index.ts
│       ├── types/
│       │   └── index.ts
│       ├── prisma/
│       │   └── prisma.service.ts
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma                    # Unified database schema
│   └── migrations/
│
├── dist/                                # Build output (generated)
├── coverage/                            # Test coverage (generated)
│
├── package.json
├── tsconfig.json
├── jest.config.js
├── Dockerfile
├── .env.example
├── .gitignore
├── API_DOCUMENTATION.md                 # API docs
├── ARCHITECTURE.md                      # Architecture guide
└── README.md                            # This file
```

## 📚 Scripts Disponibles

```bash
# Development
npm run start:dev                        # Start with hot-reload
npm run start:debug                      # Start in debug mode
npm run build                            # Build for production

# Production
npm run start:prod                       # Start production build

# Code Quality
npm run lint                             # Run TypeScript lint
npm run test                             # Run unit tests
npm run test:watch                       # Run tests in watch mode
npm run test:cov                         # Generate coverage report

# Database (Prisma)
npm run prisma:generate                  # Generate Prisma client
npm run prisma:migrate:dev              # Create migration (dev)
npm run prisma:migrate:deploy           # Deploy migrations
npm run prisma:push                     # Sync schema with DB
npm run prisma:seed                     # Run seed script
npm run prisma:studio                   # Open Prisma Studio
```

## 🔐 Arquitectura de 3 Capas

```
HTTP Request → Controller → Service → Repository → Prisma → PostgreSQL
   Response ←  JSON    ←  Logic   ←   Query    ←
```

### Presentation Layer (Controllers)
- Maneja HTTP requests/responses
- Valida DTOs
- Llama a services

### Business Layer (Services)
- Lógica de negocio
- Validaciones
- Orquestación

### Data Layer (Repositories)
- Acceso a base de datos
- Queries con Prisma
- No contiene lógica de negocio

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para más detalles.

## 🔑 Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# App
NODE_ENV=development
APP_PORT=3001

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📖 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Logout

### Usuarios
- `GET /api/users/me` - Obtener perfil
- `PATCH /api/users/me` - Actualizar perfil

### Mascotas
- `GET /api/pets` - Listar mascotas
- `POST /api/pets` - Crear mascota
- `GET /api/pets/:id` - Obtener mascota
- `PATCH /api/pets/:id` - Actualizar mascota
- `DELETE /api/pets/:id` - Eliminar mascota

### Health
- `GET /health` - Health check

Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para todos los endpoints.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test
npm run test -- auth.service

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

## 🐳 Docker

### Build imagen
```bash
docker build -t pet-quotes-backend:1.0.0 .
```

### Run contenedor
```bash
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=secret \
  pet-quotes-backend:1.0.0
```

## 🔍 Debugging

### VS Code Debugger
```bash
npm run start:debug
```

Luego attach el debugger en VS Code (F5).

### Prisma Studio
```bash
npm run prisma:studio
```

Abre UI interactiva para ver/editar base de datos en `localhost:5555`.

## 📊 Database

### Schema Unificado
Todas las entidades en un único `schema.prisma`:

- **Users** - Usuarios (CLIENT, VETERINARY, ADMIN)
- **Pets** - Mascotas
- **Clinics** - Clínicas veterinarias
- **Branches** - Sucursales
- **VeterinaryServices** - Servicios
- **Professionals** - Veterinarios/Staff
- **Availability** - Horarios
- **Appointments** - Citas
- **MedicalHistory** - Historial médico
- **Notifications** - Notificaciones

### Crear Migración
```bash
npm run prisma:migrate:dev -- --name add_new_table
```

## 🚀 Deployment

### Build para Producción
```bash
npm run build
```

Genera carpeta `dist/` lista para deployment.

### Deploying to Cloud
```bash
# Heroku
git push heroku main

# Azure
az webapp up --name pet-quotes-api

# AWS
sam deploy guided
```

## 🛠️ Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm run build
```

### Error: "Database connection refused"
```bash
# Verificar DATABASE_URL en .env
# Asegurar que PostgreSQL está corriendo
# En Docker:
docker compose up postgres-db -d
```

### Error: "Prisma client not generated"
```bash
npm run prisma:generate
```

### Puerto 3001 ya en uso
```bash
# Cambiar puerto en .env
APP_PORT=3002
```

## 📝 Convenciones de Código

### Naming
- Clases: PascalCase (`UserService`, `AuthController`)
- Métodos: camelCase (`getUser()`, `createPet()`)
- Constantes: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)
- Archivos: kebab-case (`auth.service.ts`, `user.repository.ts`)

### Estructura de Módulo
```typescript
// 1. Imports
import { Module } from '@nestjs/common';
import { Service } from './service';
import { Repository } from '@data/repositories';

// 2. Decorator
@Module({
  providers: [Service, Repository],
  exports: [Service],
})

// 3. Clase
export class MyModule {}
```

## 🤝 Contribuir

1. Create a branch: `git checkout -b feature/my-feature`
2. Commit: `git commit -am 'Add feature'`
3. Push: `git push origin feature/my-feature`
4. Create a Pull Request

## 📄 License

MIT

## 📞 Support

Para reportar bugs o sugerencias, abrir un issue en GitHub.

---

**Última actualización:** Mayo 2026  
**Versión:** 1.0.0  
**Arquitectura:** 3 Capas
