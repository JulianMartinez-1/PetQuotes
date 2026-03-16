# PET QUOTES

Plataforma SaaS para agendar citas de mascotas entre clientes y veterinarias.

GitHub del autor: https://github.com/JulianMartinez-1

## Stack

- Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS, TanStack Query, Framer Motion, Leaflet.
- Backend: NestJS (TypeScript), arquitectura por microservicios, JWT Auth, DTO validation.
- Data: PostgreSQL + Prisma ORM.
- Infra: Docker, Docker Compose, Redis, RabbitMQ, ElasticSearch.

## Arquitectura de Microservicios

- API Gateway (`3001`): entrada REST y enrutamiento.
- Auth Service (`3002`): registro, login, refresh token, roles.
- Veterinary Service (`3003`): perfil de veterinarias (base inicial).
- Catalog Service (`3004`): servicios veterinarios y modelo de catálogo.
- Appointment Service (`3005`): ciclo de citas, cache, eventos.
- Staff & Schedule Service (`3006`): disponibilidad profesional.
- Search/Geo Service (`3007`): búsqueda por servicio/ubicación (base para Elastic/PostGIS).
- Notification Service (`3008`): orquestación de notificaciones.

## Estructura del Proyecto

```
pet-quotes/
  apps/
    web/                     # Next.js frontend
  services/
    api-gateway/             # API Gateway
    auth-service/            # JWT + Prisma users
    veterinary-service/      # Perfil veterinaria
    catalog-service/         # Catalogo + prisma dominio
    staff-schedule-service/  # Agenda profesional
    appointment-service/     # Reservas funcionales
    search-geo-service/      # Geosearch
    notification-service/    # Notificaciones
  libs/
    contracts/               # Tipos compartidos
  docker-compose.yml
```

## Endpoints Principales

### API Gateway

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/appointments` (requiere `Authorization: Bearer <token>`)
- `GET /api/appointments/pet/:petId` (requiere JWT)
- `PATCH /api/appointments/:id/status` (roles `VETERINARY`, `ADMIN`)
- `PATCH /api/appointments/:id/reschedule` (roles `VETERINARY`, `ADMIN`)

### Appointment Service

- `POST /appointments`
- `GET /appointments/pet/:petId`
- `PATCH /appointments/:id/status`
- `PATCH /appointments/:id/reschedule`

Reglas Sprint 2:

- RBAC por endpoint en citas (`CLIENT`, `VETERINARY`, `ADMIN`).
- Un `CLIENT` solo puede crear citas para su propio `clientId` (debe coincidir con `sub` del JWT).
- Un `VETERINARY` solo puede actualizar/reprogramar citas cuyo `veterinarianId` coincida con su `sub`.
- Idempotencia en creación con header `x-idempotency-key`.

### Auth Service

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## Ejemplo Funcional de Reserva

1. Crear usuario:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@petquotes.com",
    "password": "PetQuotes123",
    "fullName": "Cliente Demo",
    "role": "CLIENT"
  }'
```

2. Login para obtener token:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@petquotes.com",
    "password": "PetQuotes123"
  }'
```

3. Crear cita:

```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "clientId": "client-demo-1",
    "petId": "pet-demo-1",
    "veterinarianId": "vet-demo-1",
    "serviceId": "service-consulta",
    "branchId": "branch-norte",
    "startsAt": "2026-04-01T10:00:00.000Z",
    "notes": "Control anual"
  }'
```

La UI para este flujo está en `http://localhost:3000/bookings`.

## Puesta en Marcha

1. Crear `.env` desde `.env.example`.
2. Instalar dependencias:

```bash
npm install
```

3. Generar cliente Prisma:

```bash
npm run prisma:generate --workspace services/auth-service
npm run prisma:generate --workspace services/appointment-service
```

4. Ejecutar migraciones (recomendado):

```bash
npm run prisma:migrate:deploy --workspace services/auth-service
npm run prisma:migrate:deploy --workspace services/appointment-service
```

5. Para desarrollo rápido, puedes sincronizar esquema sin historial con `prisma:push`.

6. Levantar stack:

```bash
docker compose up --build
```

7. Validar reglas Sprint 1 + Sprint 2 (refresh/logout/lockout + RBAC + idempotencia):

```bash
npm run test:sprint2:e2e
```

## Pipeline CI

El workflow en `.github/workflows/ci.yml` ejecuta dos jobs:

- `quality`: lint + build + tests unitarios (si existen en los workspaces).
- `backend-e2e`: levanta servicios con Docker Compose, valida `health` y `ready`, aplica migraciones y valida Sprint 1 + Sprint 2.

Para replicar localmente la fase de calidad:

```bash
npm run ci:lint
npm run ci:build
npm run ci:test:unit
```

## Sprint 3 (Inicio): Observabilidad

Se habilito una base de observabilidad en servicios core:

- `x-request-id` automatico por request (si no llega, se genera).
- Logs estructurados JSON por request con: metodo, path, status, duracion e IP.
- Propagacion de `x-request-id` desde API Gateway hacia servicios internos.
- Health checks:
  - Gateway: `GET /api/health`
  - Auth: `GET /health` (incluye verificacion de DB)
  - Appointment: `GET /health` (incluye verificacion de DB)
- Readiness checks:
  - Gateway: `GET /api/ready` (valida auth y appointment)
  - Auth: `GET /ready` (valida DB)
  - Appointment: `GET /ready` (valida DB y Redis)
- Metrics endpoints:
  - Gateway: `GET /api/metrics`
  - Auth: `GET /metrics`
  - Appointment: `GET /metrics`

El endpoint `metrics` expone contadores por endpoint (requests y errores) y latencia (promedio y maxima).

Para export formato Prometheus:

- Gateway: `GET /api/metrics/prometheus`
- Auth: `GET /metrics/prometheus`
- Appointment: `GET /metrics/prometheus`

Se agrego `prometheus` en `docker-compose.yml` con configuracion en `observability/prometheus.yml`.
Al levantar el stack, Prometheus queda en `http://localhost:9090`.

Alertas basicas incluidas en `observability/prometheus-alerts.yml`:

- `PetQuotesTargetDown`: target no scrapeable.
- `PetQuotesReadyEndpointFailing`: errores en endpoint `ready`.
- `PetQuotesHighErrorRate`: tasa de errores mayor a 5% en 5 minutos.

Grafana incluido en `docker-compose.yml`:

- URL: `http://localhost:3010`
- Usuario: `admin`
- Password: `admin`

Provisioning automatico:

- Datasource Prometheus: `observability/grafana/provisioning/datasources/datasource.yml`
- Dashboard base: `observability/grafana/dashboards/petquotes-overview.json`

## Sprint 4 (Inicio): Performance + Hardening

Se agregaron bases de readiness de produccion:

- Baseline de performance con SLOs de login y creacion de citas.
- Ejecucion local: `npm run perf:sprint4`
- Hardening inicial de contenedores core ejecutando como usuario no root.
- CI con reporte de `npm audit` y paso de performance baseline en `backend-e2e`.

Hardening adicional Sprint 4:

- Healthchecks de contenedor para `api-gateway`, `auth-service` y `appointment-service` en `docker-compose.yml`.
- Encadenamiento de arranque entre servicios core con `depends_on` + `condition: service_healthy`.
- Gate de seguridad gradual en CI:
  - Siempre genera reporte (`npm-audit-report`) y warning con resumen de severidades.
  - Bloquea solo en `push` a `main/master` cuando hay vulnerabilidades criticas.
  - Para pasar a modo estricto y bloquear tambien severidad `high` en ramas protegidas, define la variable de repositorio `ENFORCE_HIGH_VULN_GATE=true`.

Rollout recomendado para `ENFORCE_HIGH_VULN_GATE=true` (rama de ensayo):

1. Crear una rama de ensayo (ejemplo: `security-gate-trial`).
2. Ejecutar el workflow `pet-quotes-ci` via `workflow_dispatch` con `enforce_high_gate=true` en esa rama.
3. Repetir 2 a 3 ejecuciones y revisar:
  - estado de job `security-audit`
  - artifact `npm-audit-report`
  - resumen de severidades en logs
4. Si las 2-3 corridas son estables y sin bloqueos inesperados, activar variable de repositorio `ENFORCE_HIGH_VULN_GATE=true` para `main/master`.

## Calidad y Seguridad Incluidas

- DTO validation (`class-validator`) en endpoints críticos.
- Tipado estricto TypeScript.
- JWT con access y refresh tokens.
- Rotación y revocación de refresh token por sesión.
- Bloqueo temporal por intentos fallidos de login configurables por entorno.
- Rate limiting en auth (`@nestjs/throttler`).
- CORS habilitado por servicio.
- Security headers con Helmet.
- Formato consistente de errores en gateway/auth/appointments.
- Cache de consultas de citas en Redis.
- Publicación de eventos de cita en RabbitMQ (`petquotes.events`).
