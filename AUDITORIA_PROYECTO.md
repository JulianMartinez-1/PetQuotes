# 📋 AUDITORÍA DEL PROYECTO - PET QUOTES

**Fecha:** 2026-06-18  
**Versión:** 1.0.0  
**Tipo:** Auditoría Técnica + Plan de Despliegue Digital Ocean

---

## 📊 1. RESUMEN EJECUTIVO

| Aspecto | Descripción |
|--------|------------|
| **Nombre** | Pet Quotes Platform |
| **Tipo** | Full-Stack Web Application |
| **Arquitectura** | 3-Layer Monolith (Backend) + Next.js (Frontend) |
| **Estado** | Producción-Ready |
| **Complejidad** | Media-Alta |
| **Base de Datos** | PostgreSQL 16 (15+ tablas) |

---

## 🛠️ 2. STACK TECNOLÓGICO

### **Backend**
```
Lenguaje:        TypeScript 5.x
Runtime:         Node.js 20+
Framework:       NestJS 11.x
ORM:             Prisma 5.18.0
Auth:            JWT + bcryptjs
Validación:      class-validator
Base Datos:      PostgreSQL 16
Cache:           Redis 7
Seguridad:       Helmet, CORS
```

**Dependencias Críticas:**
- `@nestjs/common` - Core framework
- `@nestjs/config` - Environment management
- `@nestjs/jwt` - JWT authentication
- `@prisma/client` - Database ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Token management
- `passport` - Authentication middleware
- `ioredis` - Redis client

### **Frontend**
```
Lenguaje:        TypeScript 5.4.5
Runtime:         Node.js 20+
Framework:       Next.js 15.5.14
UI:              React 18.3.1
Estilos:         Tailwind CSS 3.4.10
Animaciones:     Framer Motion 11.3.22, GSAP 3.15.0
Mapas:           Google Maps, React-Leaflet
Query:           TanStack React Query 5.52.1
Auth:            NextAuth 4.24.14
Validación:      Zod 3.23.8
```

**Dependencias Críticas:**
- `next` - Framework base
- `react` - Librería UI
- `react-dom` - DOM rendering
- `next-auth` - Autenticación social
- `tailwindcss` - Utilidades CSS
- `@googlemaps/js-api-loader` - Google Maps
- `framer-motion` - Animaciones complejas
- `@tanstack/react-query` - State management

### **Infraestructura**
```
Contenedores:    Docker 24+
Orquestación:    Docker Compose
Base de Datos:   PostgreSQL 16-alpine
Cache:           Redis 7-alpine
Admin DB:        PgAdmin 4
```

---

## 🏗️ 3. ARQUITECTURA DEL PROYECTO

### **3.1 Estructura General (Monorepo)**
```
pet-quotes/
├── backend/                    # NestJS 3-Layer App
│   ├── src/
│   │   ├── presentation/      # Layer 1: HTTP Controllers + DTOs
│   │   ├── business/          # Layer 2: Business Logic Services
│   │   ├── data/              # Layer 3: Repositories + DB Access
│   │   ├── config/            # Config: JWT, DB, etc.
│   │   └── shared/            # Guards, Decorators, Exceptions
│   ├── prisma/                # Schema + Migrations
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── Dockerfile
│
├── frontend/                   # Next.js App
│   ├── app/                   # App Router (Next.js 15)
│   │   ├── (landing)/         # Landing pages
│   │   ├── api/               # API routes (middleware)
│   │   ├── login/             # Auth pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── bookings/          # Appointment booking
│   │   ├── clinics/           # Clinic management
│   │   ├── pets/              # Pet management
│   │   ├── services/          # Service pages
│   │   └── admin/             # Admin panel
│   ├── components/            # Reusable components
│   │   ├── auth/
│   │   ├── clinics/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── ...
│   ├── lib/                   # Utilities
│   ├── hooks/                 # Custom React hooks
│   ├── contexts/              # React contexts
│   ├── store/                 # State management
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── docker-compose.yml         # Service orchestration
└── .env                       # Environment variables
```

### **3.2 Arquitectura de 3 Capas (Backend)**

```
┌─────────────────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN (HTTP)                     │
│  Controllers → DTOs → Validators → Auth Guards          │
│         /api/auth, /api/users, /api/clinics, etc.      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         CAPA DE NEGOCIO (Business Logic)                │
│  Services → Validation → Authorization → Domain Logic   │
│    AuthService, UserService, ClinicService, etc.       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         CAPA DE DATOS (Data Access)                     │
│  Repositories → Prisma ORM → PostgreSQL                │
│    UserRepository, ClinicRepository, etc.               │
└─────────────────────────────────────────────────────────┘
```

### **3.3 Servicios Principales (Backend)**

| Módulo | Responsabilidad | Componentes |
|--------|-----------------|------------|
| **auth** | Autenticación y OAuth | AuthService, OAuthService, JwtManager |
| **users** | Gestión de usuarios | UserService, UserRepository |
| **pets** | Gestión de mascotas | PetService, PetRepository |
| **clinics** | Gestión de clínicas y sucursales | ClinicService, BranchService |
| **appointments** | Citas veterinarias | AppointmentService |
| **professionals** | Profesionales/Veterinarios | ProfessionalService |
| **notifications** | Sistema de notificaciones | NotificationService |

### **3.4 Flujo de Autenticación**

```
User Input (Login)
    ↓
frontend/app/login → POST /api/session/login
    ↓
backend/api/auth/login (JwtAuthGuard)
    ↓
AuthService.login() → Password verification (bcryptjs)
    ↓
JwtManager.generateTokens() → accessToken + refreshToken
    ↓
setSessionCookies() + setCsrfCookie()
    ↓
Response + localStorage update
    ↓
Router.push("/dashboard")
```

### **3.5 Flujo de Integración Frontend-Backend**

```
Frontend (Next.js):
- /api/session/* routes → Middleware layer
- Cookies + localStorage para persistencia
- JWT en Authorization header

Backend (NestJS):
- JwtAuthGuard valida tokens en cada request
- CORS habilitado para localhost:3000
- Respuestas en formato JSON estandarizado

BD (PostgreSQL):
- Prisma maneja migraciones automáticas
- Indexes en campos críticos (userId, startTime, etc.)
```

---

## 🗄️ 4. ESTRUCTURA DE LA BASE DE DATOS

### **4.1 Resumen de Tablas (15 + Índices)**

| Tabla | Propósito | Registros Est. |
|-------|-----------|-----------------|
| `users` | Usuarios (Clientes, Veterinarios, Admin) | 1000+ |
| `social_accounts` | OAuth (Google, Facebook, GitHub) | 500+ |
| `refresh_sessions` | Sesiones de refresh token | 10000+ |
| `pets` | Mascotas registradas | 5000+ |
| `clinics` | Clínicas veterinarias | 50+ |
| `branches` | Sucursales por clínica | 200+ |
| `professionals` | Veterinarios/Personal | 300+ |
| `availability` | Disponibilidad profesionales | 2100+ |
| `veterinary_services` | Servicios (consulta, cirugía, etc.) | 300+ |
| `appointments` | Citas programadas | 10000+ |
| `medical_history` | Historial médico de mascotas | 10000+ |
| `vaccines` | Vacunas administradas | 5000+ |
| `medications` | Medicamentos recetados | 3000+ |
| `notifications` | Notificaciones del sistema | 50000+ |

### **4.2 Diagrama E-R Simplificado**

```
users ──────────┬──────────────┬──────────────┬──────────────┐
                │              │              │              │
                ▼              ▼              ▼              ▼
            pets         clinics      professionals   notifications
                │              │              │
                ▼              ▼              ▼
          medical_     veterinary_      availability
          history      services
                │              │              │
                └──────┬───────┴──────┬───────┘
                       ▼              ▼
                  appointments
                       │
                ┌──────┴──────┐
                ▼             ▼
            vaccines      medications
```

### **4.3 Modelos Críticos**

#### **User**
```prisma
model User {
  id                  String        @id @default(cuid())
  email               String        @unique
  passwordHash        String
  fullName            String
  phone               String?
  role                UserRole      @default(CLIENT)  // CLIENT, VETERINARY, ADMIN
  failedLoginAttempts Int           @default(0)
  lockedUntil         DateTime?
  emailVerified       Boolean       @default(false)
  profileImage        String?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
}
```

#### **Pet**
```prisma
model Pet {
  id              String        @id @default(cuid())
  ownerId         String        // Foreign key: User
  name            String?
  species         String        // dog, cat, rabbit, bird, etc.
  breed           String?
  birthDate       DateTime?
  weight          Float?        // kg
  microchip       String?       @unique
  vaccinesUpToDate Boolean      @default(false)
}
```

#### **Appointment**
```prisma
model Appointment {
  id              String              @id @default(cuid())
  clientId        String              // Foreign key: User
  petId           String              // Foreign key: Pet
  professionalId  String              // Foreign key: Professional
  serviceId       String              // Foreign key: VeterinaryService
  branchId        String              // Foreign key: Branch
  clinicId        String              // Foreign key: Clinic
  status          AppointmentStatus   @default(PENDING)
  startTime       DateTime
  endTime         DateTime?
}
```

### **4.4 Índices Principales (Performance)**

```sql
-- Búsquedas rápidas de citas
INDEX appointments(clientId, startTime)
INDEX appointments(professionalId, startTime)
INDEX appointments(clinicId, startTime)

-- Validación de disponibilidad
INDEX availability(professionalId, dayOfWeek)

-- Búsquedas de notificaciones
INDEX notifications(userId, read)
INDEX notifications(createdAt)

-- Búsquedas de medicinas/vacunas
INDEX medications(petId, status)
INDEX vaccines(petId, nextDueDate)
```

### **4.5 Relaciones de Integridad**

```
CASCADE:
- User → pets, clinics, notifications
- Clinic → branches, services
- Branch → professionals
- Pet → medical_history, vaccines, medications

RESTRICT:
- Professional → appointments
- VeterinaryService → appointments
```

---

## 🚀 5. REQUISITOS PARA DESPLIEGUE EN DIGITAL OCEAN

### **5.1 Recurso Recomendado: Droplet**

#### **Especificaciones Mínimas**
```
├── CPU:           2 vCPU (Shared Processor)
├── RAM:           4 GB
├── Storage:       80 GB SSD
├── Bandwidth:     4 TB/mes
├── SO:            Ubuntu 22.04 LTS
└── Costo:         ~$24 USD/mes
```

#### **Especificaciones Recomendadas (Producción)**
```
├── CPU:           4 vCPU
├── RAM:           8 GB
├── Storage:       160 GB SSD
├── Bandwidth:     8 TB/mes
├── SO:            Ubuntu 22.04 LTS
└── Costo:         ~$48 USD/mes
```

### **5.2 Software a Instalar**

#### **1. Node.js 20 LTS**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### **2. Docker & Docker Compose**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

#### **3. PostgreSQL (Cliente)**
```bash
sudo apt-get install -y postgresql-client
```

#### **4. Git**
```bash
sudo apt-get install -y git
```

#### **5. Nginx (Reverse Proxy)**
```bash
sudo apt-get install -y nginx
```

#### **6. Certbot (SSL/HTTPS)**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### **5.3 Configuración de Volúmenes & Storage**

```
├── /app/
│   ├── pet-quotes/          # Código fuente (clonado de GitHub)
│   └── .env                 # Secretos (NO en repo)
├── /var/lib/docker/         # Datos de Docker (volumes)
│   ├── postgresql/          # BD persistence
│   ├── redis/               # Cache persistence
│   └── pgadmin/             # Datos PgAdmin
└── /var/log/               # Logs de la aplicación
```

### **5.4 Variables de Entorno (Producción)**

```bash
# === DATABASE ===
DATABASE_URL="postgresql://pet_quotes:STRONG_PASSWORD@postgres-db:5432/pet_quotes_db"
DATABASE_USER="pet_quotes"
DATABASE_PASSWORD="VERY_STRONG_PASSWORD_32CHARS"
DATABASE_NAME="pet_quotes_db"

# === JWT ===
JWT_SECRET="EXTREMELY_LONG_RANDOM_SECRET_64CHARS_OR_MORE"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# === APP ===
NODE_ENV="production"
APP_PORT="3001"
APP_NAME="Pet Quotes API"

# === FRONTEND ===
FRONTEND_URL="https://tudominio.com"
NEXT_PUBLIC_API_URL="https://api.tudominio.com"

# === OAUTH ===
OAUTH_GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
OAUTH_GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
OAUTH_FACEBOOK_CLIENT_ID="xxxxx"
OAUTH_FACEBOOK_CLIENT_SECRET="xxxxx"

# === SMTP (Email) ===
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-contraseña-especial"

# === OBSERVABILITY ===
PROMETHEUS_ENABLED="true"
PROMETHEUS_PORT="9090"

# === REDIS ===
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_DB="0"

# === GOOGLE MAPS ===
GOOGLE_MAPS_API_KEY="AIzaSyD-xxxxx"

# === PGADMIN ===
PGADMIN_EMAIL="admin@tudominio.com"
PGADMIN_PASSWORD="STRONG_PASSWORD"
```

### **5.5 Estructura del Droplet (Post-Setup)**

```
/root/
├── .ssh/                          # SSH keys
│   └── authorized_keys            # Para acceso seguro
│
/home/app_user/
├── pet-quotes/                    # Clonado de GitHub
│   ├── .env                       # NO en repo (secretos)
│   ├── docker-compose.prod.yml    # Config producción
│   ├── backend/
│   ├── frontend/
│   └── ...
│
/var/lib/docker/volumes/
├── pet_quotes_data/               # DB PostgreSQL
├── redis_data/                    # Cache Redis
└── pgadmin_data/                  # PgAdmin
│
/etc/nginx/sites-available/
├── pet-quotes-api                 # Config API (3001)
└── pet-quotes-web                 # Config Web (3000)
│
/etc/letsencrypt/live/
├── tudominio.com/                 # SSL certificates
└── api.tudominio.com/
```

### **5.6 Pre-Requisitos: Checklist**

#### **🔐 Seguridad**
- [ ] Claves SSH configuradas (sin contraseña)
- [ ] Firewall habilitado (ufw)
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] Secretos en `.env` (20+ caracteres para contraseñas)
- [ ] JWT_SECRET generado aleatoriamente
- [ ] DATABASE_PASSWORD fuerte (32+ caracteres)
- [ ] SMTP credenciales configuradas

#### **🗄️ Base de Datos**
- [ ] PostgreSQL 16 en el Droplet O managed database de Digital Ocean
- [ ] Backup automático habilitado
- [ ] Conexión segura (SSL en producción)

#### **🌐 DNS & Dominios**
- [ ] Dominio principal registrado (ej: petquotes.com)
- [ ] Subdominio API (ej: api.petquotes.com)
- [ ] Registros A apuntando al IP del Droplet
- [ ] Certificado SSL/TLS (vía Certbot/Let's Encrypt)

#### **📦 Docker**
- [ ] docker-compose.yml ajustado para producción
- [ ] Imágenes construidas y testeadas localmente
- [ ] Build optimizado para frontend (next build)
- [ ] Build optimizado para backend (npm run build)

#### **💾 Backups & Monitoreo**
- [ ] Estrategia de backup (Daily snapshots en DO)
- [ ] Logs centralizados (journalctl)
- [ ] Monitoreo de recursos (DO Monitoring)
- [ ] Alertas habilitadas

---

## 📋 6. CHECKLIST DE DESPLIEGUE PASO A PASO

### **Fase 1: Provisión del Droplet (30 min)**

```bash
# 1. Crear Droplet en Digital Ocean
# - Ubuntu 22.04 LTS
# - 4 GB RAM, 2 vCPU, 80 GB SSD
# - Region: Más cercana a usuarios
# - Habilitar backups automáticos

# 2. SSH al Droplet
ssh root@YOUR_DROPLET_IP

# 3. Update sistema
sudo apt-get update && sudo apt-get upgrade -y

# 4. Crear usuario no-root
sudo adduser appuser
sudo usermod -aG sudo appuser
sudo usermod -aG docker appuser
```

### **Fase 2: Instalar Dependencias (20 min)**

```bash
# Ejecutar como root o con sudo
sudo apt-get install -y \
  curl \
  wget \
  git \
  nodejs \
  npm \
  docker.io \
  docker-compose \
  postgresql-client \
  nginx \
  certbot \
  python3-certbot-nginx

# Verificar instalaciones
node --version      # v20.x.x
npm --version       # 10.x.x
docker --version    # 24.x.x
nginx -v            # nginx/1.x.x
```

### **Fase 3: Configuración de Seguridad (15 min)**

```bash
# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# SSH Key setup
ssh-copy-id -i ~/.ssh/id_rsa.pub appuser@YOUR_DROPLET_IP

# Disable root SSH login
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### **Fase 4: Clonar Repositorio (5 min)**

```bash
cd /home/appuser
git clone https://github.com/tu-usuario/pet-quotes.git
cd pet-quotes
```

### **Fase 5: Configurar Variables de Entorno (10 min)**

```bash
# Crear .env en raíz del proyecto
cat > .env << 'EOF'
# Copiar desde el template, actualizar valores
DATABASE_URL="postgresql://pet_quotes:STRONG_PASSWORD@postgres-db:5432/pet_quotes_db"
JWT_SECRET="VERY_LONG_RANDOM_SECRET"
NODE_ENV="production"
FRONTEND_URL="https://petquotes.com"
# ... más variables
EOF

chmod 600 .env  # Solo readable por appuser
```

### **Fase 6: Configurar Docker Compose (10 min)**

```bash
# Crear docker-compose.prod.yml
cat > docker-compose.prod.yml << 'EOF'
# Basado en docker-compose.yml pero:
# - Remove pgadmin (opcional en prod)
# - Set NODE_ENV=production
# - Configure restart policies
# - Set proper logging
EOF

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

### **Fase 7: Ejecutar Migraciones BD (5 min)**

```bash
# Esperar a que PostgreSQL esté listo
sleep 30

# Aplicar migraciones Prisma
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy

# Seed inicial (admin user)
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

### **Fase 8: Configurar Nginx (15 min)**

```bash
# Crear config para API
sudo tee /etc/nginx/sites-available/api.petquotes.com << 'EOF'
upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name api.petquotes.com;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Crear config para Frontend
sudo tee /etc/nginx/sites-available/petquotes.com << 'EOF'
upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name petquotes.com www.petquotes.com;
    
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Habilitar sites
sudo ln -s /etc/nginx/sites-available/api.petquotes.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/petquotes.com /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar
sudo systemctl reload nginx
```

### **Fase 9: SSL/TLS con Let's Encrypt (10 min)**

```bash
# Obtener certificados
sudo certbot --nginx -d petquotes.com -d www.petquotes.com
sudo certbot --nginx -d api.petquotes.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verificar
sudo systemctl status certbot.timer
```

### **Fase 10: Verificación Final (10 min)**

```bash
# Verificar servicios
docker-compose -f docker-compose.prod.yml logs --tail=50

# Probar endpoints
curl -I https://petquotes.com
curl -I https://api.petquotes.com/health

# Ver logs en vivo
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 🔍 7. OPCIONES ALTERNATIVAS A DROPLET

### **Opción 1: App Platform (Recomendado si NO quieres administrar servidor)**
- Deploy automático desde GitHub
- SSL gratis
- Escalado automático
- Costo: ~$12-50 USD/mes
- Setup: ~15 min
- ✅ Ventaja: Sin mantener servidor

### **Opción 2: Kubernetes (DigitalOcean DOKS)**
- Alta disponibilidad
- Auto-escalado
- Complejidad: 🟥🟥🟥
- Costo: ~$12 USD (cluster) + compute
- ✅ Ventaja: Escalable profesional

### **Opción 3: Droplet + Managed Database**
- BD separada del Droplet
- Backups automáticos
- Replicación
- Costo: Droplet $24 + BD $15 = $39 USD/mes
- ✅ Ventaja: Mejor para datos

---

## ⚠️ 8. CONSIDERACIONES IMPORTANTES

### **Monitoreo en Producción**
```bash
# Monitoreo de recursos
watch -n 1 'docker stats'

# Logs centralizados
docker-compose -f docker-compose.prod.yml logs -f

# Alertas
DO Monitoring → Droplet metrics
```

### **Scaling Horizontal**
```
Si la app crece:
- Separar BD en Managed Database
- Usar CDN (Cloudflare) para assets estáticos
- Cache distribuido (Redis cluster)
- Load balancing con Nginx
```

### **Disaster Recovery**
```
- Snapshots diarios del Droplet
- Backups de BD automáticos
- Repositorio en GitHub como backup de código
- Documentación de rollback procedures
```

---

## 📞 9. SOPORTE Y RECURSOS

- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Docker Docs:** https://docs.docker.com
- **Digital Ocean Docs:** https://docs.digitalocean.com
- **PostgreSQL:** https://www.postgresql.org/docs/16

---

**Última actualización:** 2026-06-18  
**Próxima revisión:** 2026-09-18
