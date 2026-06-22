# Guía de Despliegue — Pet Quotes en DigitalOcean

**Dominio:** `petquotes.online` (frontend) · `api.petquotes.online` (backend API)
**Servidor:** Ubuntu 22.04 LTS, DigitalOcean Droplet (mínimo 2 GB RAM; recomendado 4 GB)
**Arquitectura:** Monorepo → imágenes Docker publicadas en **ghcr.io** → Droplet las descarga y ejecuta con `docker compose`.

> El Droplet **no clona el repositorio** ni construye imágenes. Solo descarga imágenes ya construidas
> desde GitHub Container Registry y levanta los servicios con `docker compose`.

---

## Prerrequisitos — Antes de tocar el servidor

### DNS en Hostinger

En el panel de Hostinger, ve a **DNS Zone** de `petquotes.online` y crea estos registros:

| Tipo | Host | Valor | TTL |
|------|------|-------|-----|
| A | `@` | `<IP del Droplet>` | 3600 |
| A | `www` | `<IP del Droplet>` | 3600 |
| A | `api` | `<IP del Droplet>` | 3600 |

> Reemplaza `<IP del Droplet>` con la IP pública que aparece en tu panel de DigitalOcean.
> La propagación DNS puede tardar entre 5 y 60 minutos. Verifica con `dig petquotes.online` antes de
> ejecutar Certbot (Parte 4).

### Credenciales OAuth

En cada consola de proveedor OAuth, agrega `https://petquotes.online/oauth/callback` como redirect URI:

- **Google:** [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → tu OAuth 2.0 Client ID
- **GitHub:** Settings → Developer settings → OAuth Apps → tu app → Authorization callback URL
- **Facebook / Microsoft:** consola equivalente

---

## PARTE 1 — Preparación del Droplet

### 1.2 Acceso inicial y actualización del sistema

> **Ejecutar en:** tu máquina local

```bash
ssh root@<IP_DEL_DROPLET>
```

> **Ejecutar en:** Droplet como `root`

```bash
apt update && apt upgrade -y

# Instala dependencias base (nginx y certbot se verifican en la Parte 2)
apt install -y curl git ufw nginx certbot python3-certbot-nginx
```

---

### 1.3 Crear usuario no-root para el deploy

> **Ejecutar en:** Droplet como `root`

```bash
# Crea el usuario y asígnale contraseña
adduser appuser

# Dale permisos sudo
usermod -aG sudo appuser

# Copia las claves SSH de root para que puedas conectarte como appuser
mkdir -p /home/appuser/.ssh
cp ~/.ssh/authorized_keys /home/appuser/.ssh/authorized_keys
chown -R appuser:appuser /home/appuser/.ssh
chmod 700 /home/appuser/.ssh
chmod 600 /home/appuser/.ssh/authorized_keys
```

Desde ahora usa siempre `appuser` en lugar de `root`. Verifica el acceso desde tu máquina local:

> **Ejecutar en:** tu máquina local

```bash
ssh appuser@<IP_DEL_DROPLET>
```

---

### 1.5 Configurar firewall (UFW)

> **Ejecutar en:** Droplet como `root` (o `appuser` con `sudo`)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

> `Nginx Full` abre los puertos 80 y 443.
> Los puertos internos (3000, 3001, 3009, 5432, 6379) **NO** deben abrirse —
> Docker los expone únicamente en `127.0.0.1`.

---

## PARTE 2 — Instalación de Docker y dependencias

### 2.1 Instalar Docker Engine

> **Ejecutar en:** Droplet como `root` (o `appuser` con `sudo`)

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Plugin Docker Compose v2
apt install -y docker-compose-plugin

# Agrega appuser al grupo docker (para no necesitar sudo en cada comando)
usermod -aG docker appuser

# Verifica
docker --version
docker compose version
```

> Cierra sesión y vuelve a entrar como `appuser` para que el grupo docker surta efecto:
> ```bash
> exit
> ssh appuser@<IP_DEL_DROPLET>
> ```

---

### 2.2 Verificar Nginx (ya instalado con Certbot)

> **Ejecutar en:** Droplet como `appuser`

```bash
nginx -v
sudo systemctl status nginx
```

Si no está activo: `sudo systemctl start nginx`

---

### 2.3 Verificar Certbot (ya configurado)

> **Ejecutar en:** Droplet como `appuser`

```bash
certbot --version
```

> Certbot se usa en la **Parte 4** para obtener el certificado SSL. Aquí solo verificamos que
> la instalación es correcta.

---

### 2.4 Instalar Fail2Ban (protección contra fuerza bruta SSH)

> **Ejecutar en:** Droplet como `root` (o `appuser` con `sudo`)

```bash
apt install -y fail2ban

# Crea la configuración local (no editar jail.conf directamente)
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 10m
findtime = 10m
maxretry = 5

[sshd]
enabled = true
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Verifica
fail2ban-client status sshd
```

---

## PARTE 3 — Archivos de configuración en el Droplet

### 3.1 Estructura de directorios

> **Ejecutar en:** Droplet como `appuser`

```bash
mkdir -p /home/appuser/pet-quotes
cd /home/appuser/pet-quotes
```

El Droplet solo necesita dos archivos en este directorio:

```
/home/appuser/pet-quotes/
├── docker-compose.yml   ← usa imágenes de ghcr.io, sin build
└── .env                 ← secrets de producción, nunca va a git
```

---

### 3.2 Archivo docker-compose.yml

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
nano /home/appuser/pet-quotes/docker-compose.yml
```

Pega el siguiente contenido. Reemplaza `<TU_USUARIO>` con tu nombre de usuario de GitHub (en minúsculas):

```yaml
services:

  postgres-db:
    image: postgres:16-alpine
    container_name: pet_quotes_postgres
    env_file:
      - .env
    environment:
      POSTGRES_USER: ${DATABASE_USER:-pet_quotes}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD:-changeme}
      POSTGRES_DB: ${DATABASE_NAME:-pet_quotes_db}
    volumes:
      - pet_quotes_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER:-pet_quotes} -d ${DATABASE_NAME:-pet_quotes_db}"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - pet_quotes_network
    restart: unless-stopped

  backend:
    image: ghcr.io/<TU_USUARIO>/pet-quotes-backend:latest
    container_name: pet_quotes_backend
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER:-pet_quotes}:${DATABASE_PASSWORD:-changeme}@postgres-db:5432/${DATABASE_NAME:-pet_quotes_db}
      NODE_ENV: production
      APP_PORT: 3001
      FRONTEND_URL: https://petquotes.online
    ports:
      - "127.0.0.1:3001:3001"
    depends_on:
      postgres-db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - pet_quotes_network
    restart: unless-stopped

  frontend:
    image: ghcr.io/<TU_USUARIO>/pet-quotes-frontend:latest
    container_name: pet_quotes_frontend
    env_file:
      - .env
    environment:
      NODE_ENV: production
      API_BASE_URL: http://backend:3001
      JWT_ACCESS_SECRET: ${JWT_SECRET}
      API_PROXY_TIMEOUT_MS: ${API_PROXY_TIMEOUT_MS:-8000}
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      - backend
    volumes:
      - pet_uploads:/app/public/uploads/pets
    networks:
      - pet_quotes_network
    restart: unless-stopped

  analytics-service:
    image: ghcr.io/<TU_USUARIO>/pet-quotes-analytics:latest
    container_name: pet_quotes_analytics
    env_file:
      - .env
    environment:
      ANALYTICS_DB_URL: postgresql://${DATABASE_USER:-pet_quotes}:${DATABASE_PASSWORD:-changeme}@postgres-db:5432/${DATABASE_NAME:-pet_quotes_db}
      JWT_SECRET: ${JWT_SECRET}
      JWT_ALGORITHM: HS256
      ANALYTICS_PORT: 3009
      LOG_LEVEL: info
    depends_on:
      postgres-db:
        condition: service_healthy
    networks:
      - pet_quotes_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:3009/health')\""]
      interval: 15s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: pet_quotes_redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - pet_quotes_network
    restart: unless-stopped

volumes:
  pet_quotes_data:
    driver: local
  redis_data:
    driver: local
  pet_uploads:
    driver: local

networks:
  pet_quotes_network:
    driver: bridge
```

---

### 3.3 Archivo .env

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
nano /home/appuser/pet-quotes/.env
```

Pega y rellena el siguiente contenido:

```env
# ── Database ──────────────────────────────────────────────────
DATABASE_USER=pet_quotes
DATABASE_PASSWORD=<contraseña_fuerte>
DATABASE_NAME=pet_quotes_db
DATABASE_URL=postgresql://pet_quotes:<contraseña_fuerte>@postgres-db:5432/pet_quotes_db

# ── JWT ── genera con: openssl rand -hex 32 ───────────────────
JWT_SECRET=<secreto_jwt_largo_aleatorio>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# ── App ───────────────────────────────────────────────────────
NODE_ENV=production
APP_PORT=3001
FRONTEND_URL=https://petquotes.online

# ── OAuth — Google ────────────────────────────────────────────
OAUTH_GOOGLE_CLIENT_ID=<id_de_google>
OAUTH_GOOGLE_CLIENT_SECRET=<secreto_de_google>

# ── OAuth — GitHub ────────────────────────────────────────────
OAUTH_GITHUB_CLIENT_ID=<id_de_github>
OAUTH_GITHUB_CLIENT_SECRET=<secreto_de_github>

# ── OAuth — Facebook ─────────────────────────────────────────
OAUTH_FACEBOOK_CLIENT_ID=<id_de_facebook>
OAUTH_FACEBOOK_CLIENT_SECRET=<secreto_de_facebook>

# ── OAuth — Microsoft ────────────────────────────────────────
OAUTH_MICROSOFT_CLIENT_ID=<id_de_microsoft>
OAUTH_MICROSOFT_CLIENT_SECRET=<secreto_de_microsoft>

# ── OAuth state secret — genera con: openssl rand -hex 32 ─────
OAUTH_STATE_SECRET=<secreto_oauth_state>

# ── Callback URLs ─────────────────────────────────────────────
GOOGLE_CALLBACK_URL=https://petquotes.online/oauth/callback
GITHUB_CALLBACK_URL=https://petquotes.online/oauth/callback
FACEBOOK_CALLBACK_URL=https://petquotes.online/oauth/callback
MICROSOFT_CALLBACK_URL=https://petquotes.online/oauth/callback

# ── Email (Resend) ────────────────────────────────────────────
RESEND_API_KEY=re_<tu_clave_resend>
RESEND_FROM_EMAIL=noreply@petquotes.online

# ── Redis ─────────────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# ── Google Maps ───────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<tu_clave_google_maps>
GOOGLE_MAPS_API_KEY=<tu_clave_google_maps>

# ── Frontend — vars bakeadas en la imagen en build time ───────
NEXT_PUBLIC_API_BASE_URL=https://api.petquotes.online
NEXT_PUBLIC_API_URL=https://api.petquotes.online
NEXT_PUBLIC_API_TIMEOUT_MS=10000

# ── Frontend — vars de runtime (server-side proxy) ────────────
API_BASE_URL=http://backend:3001
JWT_ACCESS_SECRET=<mismo_valor_que_JWT_SECRET>
API_PROXY_TIMEOUT_MS=8000

# ── Analytics ─────────────────────────────────────────────────
ANALYTICS_PORT=3009
LOG_LEVEL=info

# ── PgAdmin (acceso vía SSH tunnel, ver Parte 7) ──────────────
PGADMIN_EMAIL=admin@petquotes.online
PGADMIN_PASSWORD=<contraseña_pgadmin>
```

Asegura permisos restrictivos inmediatamente:

```bash
chmod 600 /home/appuser/pet-quotes/.env
```

> **Genera contraseñas y secretos fuertes:**
> ```bash
> # Ejecutar en: Droplet o tu máquina local
> openssl rand -hex 32    # para JWT_SECRET, OAUTH_STATE_SECRET
> openssl rand -base64 24 # para contraseñas de DB / PgAdmin
> ```

---

## PARTE 4 — Configurar Nginx para la aplicación

### 4.1 Configuración nginx

Primero, copia el archivo de configuración del repo local al Droplet:

> **Ejecutar en:** tu máquina local (desde la raíz del repositorio)

```bash
scp nginx/petquotes.conf appuser@<IP_DEL_DROPLET>:/tmp/petquotes.conf
```

Luego, activa el sitio en Nginx:

> **Ejecutar en:** Droplet como `appuser`

```bash
sudo mv /tmp/petquotes.conf /etc/nginx/sites-available/petquotes
sudo ln -s /etc/nginx/sites-available/petquotes /etc/nginx/sites-enabled/petquotes
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

A continuación, obtén el certificado SSL con Certbot. Espera a que el DNS haya propagado antes
de este paso (verifica con `dig petquotes.online` — debe devolver la IP del Droplet):

> **Ejecutar en:** Droplet como `appuser`

```bash
sudo certbot --nginx \
  -d petquotes.online \
  -d www.petquotes.online \
  -d api.petquotes.online \
  --non-interactive --agree-tos \
  -m julicamimartinez04@gmail.com

sudo nginx -t && sudo systemctl reload nginx
```

Certbot actualiza automáticamente `/etc/nginx/sites-available/petquotes` con los bloques SSL.

---

### 4.2 Verificar renovación automática de SSL

> **Ejecutar en:** Droplet como `appuser`

```bash
# Simula una renovación (no renueva realmente)
sudo certbot renew --dry-run

# Verifica el timer automático de systemd
systemctl list-timers | grep certbot
```

Si el dry-run pasa sin errores, la renovación automática está correctamente configurada.

---

## PARTE 5 — CI/CD con GitHub Actions

El flujo automatizado funciona así: al hacer push a `main`, GitHub Actions construye las imágenes
Docker, las publica en ghcr.io y luego hace SSH al Droplet para hacer `docker compose pull` y
reiniciar los contenedores actualizados.

---

### 5.1 Generar llave SSH dedicada para GitHub Actions

> **Ejecutar en:** Droplet como `appuser`

```bash
# Genera el par de claves (sin passphrase)
ssh-keygen -t ed25519 -C "github-actions@petquotes" \
  -f ~/.ssh/github_actions_key -N ""

# Autoriza la clave pública para login
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Muestra la clave PRIVADA para copiarla al siguiente paso
cat ~/.ssh/github_actions_key
```

Copia el contenido completo de la clave privada (incluye `-----BEGIN OPENSSH PRIVATE KEY-----`
hasta `-----END OPENSSH PRIVATE KEY-----`).

---

### 5.2 Configurar GitHub Secrets

> **Ejecutar en:** GitHub → tu repositorio → Settings → Secrets and variables → Actions → New repository secret

Crea los siguientes secrets:

| Secret | Valor |
|--------|-------|
| `DEPLOY_SSH_KEY` | Contenido completo de `~/.ssh/github_actions_key` (clave privada del paso anterior) |
| `DROPLET_HOST` | IP pública del Droplet |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Tu API Key de Google Maps (necesaria al construir la imagen del frontend) |

> El `GITHUB_TOKEN` para publicar en ghcr.io es **automático** en GitHub Actions — no requiere
> configuración adicional.

---

### 5.3 Hacer las imágenes ghcr.io accesibles desde el Droplet

El Droplet necesita autenticarse en ghcr.io para poder hacer `docker compose pull` de imágenes
privadas.

> **Ejecutar en:** GitHub → tu perfil → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

Crea un token con el scope `read:packages` (solo lectura de paquetes). Luego:

> **Ejecutar en:** Droplet como `appuser`

```bash
# Reemplaza <TU_USUARIO> y <TU_PAT> con tus datos
echo "<TU_PAT>" | docker login ghcr.io -u <TU_USUARIO> --password-stdin
```

El login queda guardado en `~/.docker/config.json` y persiste entre reinicios del servidor.

---

### 5.4 Workflow del Frontend

> **Ejecutar en:** tu máquina local — guarda este archivo en `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy — Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - 'docker-compose.yml'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  build-push:
    name: Build & push frontend image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: frontend/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/pet-quotes-frontend:latest
          build-args: |
            NEXT_PUBLIC_API_BASE_URL=https://api.petquotes.online
            NEXT_PUBLIC_API_URL=https://api.petquotes.online
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${{ secrets.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }}
            NEXT_PUBLIC_API_TIMEOUT_MS=10000

  deploy:
    name: Deploy to Droplet
    needs: build-push
    runs-on: ubuntu-latest

    steps:
      - name: SSH and redeploy frontend
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DROPLET_HOST }}
          username: appuser
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /home/appuser/pet-quotes
            docker compose pull frontend
            docker compose up -d --no-deps frontend
```

> Las variables `NEXT_PUBLIC_*` se **bakean** en el bundle de JavaScript al construir la imagen.
> Cambiarlas después requiere reconstruir la imagen y redesplegar.

---

### 5.5 Workflow del Backend

> **Ejecutar en:** tu máquina local — guarda este archivo en `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy — Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'analytics-service/**'
      - 'docker-compose.yml'
      - '.github/workflows/deploy-backend.yml'

jobs:
  build-push:
    name: Build & push backend images
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: backend/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/pet-quotes-backend:latest

      - name: Build and push analytics-service
        uses: docker/build-push-action@v5
        with:
          context: ./analytics-service
          file: analytics-service/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/pet-quotes-analytics:latest

  deploy:
    name: Deploy to Droplet
    needs: build-push
    runs-on: ubuntu-latest

    steps:
      - name: SSH and redeploy backend
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DROPLET_HOST }}
          username: appuser
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /home/appuser/pet-quotes
            docker compose pull backend analytics-service
            docker compose up -d --no-deps backend analytics-service
            docker compose exec -T backend npx prisma migrate deploy
```

---

## PARTE 6 — Primer despliegue manual

Antes de que el CI/CD esté configurado (o para un despliegue de emergencia), construye y publica
las imágenes desde tu máquina local.

### 6.1 Publicar las imágenes desde tu máquina local

> **Ejecutar en:** tu máquina local, desde la raíz del repositorio (`Pet quotes/`)

```bash
# Autentícate en ghcr.io (te pedirá tu PAT con scope write:packages)
docker login ghcr.io -u <TU_USUARIO>

# ── Backend ──────────────────────────────────────────────────
docker build -t ghcr.io/<TU_USUARIO>/pet-quotes-backend:latest \
  -f backend/Dockerfile .
docker push ghcr.io/<TU_USUARIO>/pet-quotes-backend:latest

# ── Frontend (las NEXT_PUBLIC_* se bakean aquí) ───────────────
docker build -t ghcr.io/<TU_USUARIO>/pet-quotes-frontend:latest \
  -f frontend/Dockerfile . \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.petquotes.online \
  --build-arg NEXT_PUBLIC_API_URL=https://api.petquotes.online \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<tu_clave_google_maps> \
  --build-arg NEXT_PUBLIC_API_TIMEOUT_MS=10000
docker push ghcr.io/<TU_USUARIO>/pet-quotes-frontend:latest

# ── Analytics Service ─────────────────────────────────────────
docker build -t ghcr.io/<TU_USUARIO>/pet-quotes-analytics:latest \
  ./analytics-service
docker push ghcr.io/<TU_USUARIO>/pet-quotes-analytics:latest
```

---

### 6.2 Levantar la aplicación en el Droplet

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
# Descarga todas las imágenes desde ghcr.io
docker compose pull

# Levanta todos los servicios en background
docker compose up -d

# Aplica las migraciones de base de datos
# (espera ~20 segundos a que postgres esté healthy)
docker compose exec -T backend npx prisma migrate deploy

# Verifica el estado de todos los contenedores
docker compose ps
```

> **No ejecutes `prisma migrate dev`** en producción — eso crea migraciones nuevas.
> `prisma migrate deploy` solo aplica las migraciones ya existentes en `backend/prisma/migrations/`.

---

### 6.3 Verificar el despliegue completo

> **Ejecutar en:** tu máquina local o cualquier terminal con acceso a internet

```bash
# Health check del backend
curl https://api.petquotes.online/api/health
# Respuesta esperada: {"status":"ok"}

# Verificar que el frontend responde
curl -I https://petquotes.online
# Respuesta esperada: HTTP/2 200
```

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
# Revisar logs de cada servicio
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
docker compose logs analytics-service --tail=50
```

Abre `https://petquotes.online` en el navegador. Si ves la app funcionando, el despliegue fue exitoso.

---

## PARTE 7 — Comandos de operación diaria

> Todos los comandos siguientes se ejecutan en el Droplet como `appuser`, en `/home/appuser/pet-quotes`.

### Ver logs en tiempo real

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f analytics-service
```

### Reiniciar un servicio específico

```bash
docker compose restart backend
docker compose restart frontend
```

### Actualizar manualmente (sin esperar al CI)

```bash
docker compose pull
docker compose up -d
# Si hay migraciones nuevas:
docker compose exec -T backend npx prisma migrate deploy
```

### Backup de la base de datos

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
docker compose exec postgres-db pg_dump \
  -U pet_quotes pet_quotes_db > backup-$(date +%Y%m%d).sql
```

### Restaurar un backup

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
cat backup-20260621.sql | docker compose exec -T postgres-db \
  psql -U pet_quotes pet_quotes_db
```

### Acceder a PgAdmin (vía SSH tunnel)

Nunca expongas el puerto de PgAdmin directamente. Usa un tunnel SSH:

> **Ejecutar en:** tu máquina local

```bash
ssh -L 5050:127.0.0.1:5050 appuser@<IP_DEL_DROPLET>
# Luego abre http://localhost:5050 en el navegador
```

Para levantar PgAdmin temporalmente, añade este servicio al `docker-compose.yml` del Droplet:

```yaml
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pet_quotes_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "127.0.0.1:5050:80"
    networks:
      - pet_quotes_network
```

Luego: `docker compose up -d pgadmin`. Recuerda bajarlo cuando no lo uses: `docker compose stop pgadmin`.

---

## PARTE 8 — Rollback

Si un despliegue nuevo rompe la aplicación, puedes volver a la versión anterior.

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

### Opción 1 — Volver a una imagen por digest (más precisa)

```bash
# Lista las imágenes disponibles con sus digests
docker images ghcr.io/<TU_USUARIO>/pet-quotes-backend --digests

# Para el servicio problemático
docker compose stop backend

# Edita docker-compose.yml y reemplaza :latest por el digest anterior:
# image: ghcr.io/<TU_USUARIO>/pet-quotes-backend@sha256:<digest>
nano /home/appuser/pet-quotes/docker-compose.yml

docker compose up -d backend
```

### Opción 2 — Volver a la imagen que tenías antes del pull

```bash
# Docker guarda la imagen anterior localmente hasta que hagas prune
docker images ghcr.io/<TU_USUARIO>/pet-quotes-backend

# Retag la imagen anterior como latest
docker tag <IMAGE_ID_ANTERIOR> ghcr.io/<TU_USUARIO>/pet-quotes-backend:latest
docker compose up -d --no-deps backend
```

### Rollback de migraciones Prisma

Las migraciones de Prisma en producción son difíciles de revertir. Ante una migración problemática:

```bash
# Marca la migración fallida como revertida manualmente
docker compose exec -T backend npx prisma migrate resolve \
  --rolled-back <nombre_de_la_migracion>
```

---

## PARTE 9 — Monitoreo básico

> **Ejecutar en:** Droplet como `appuser`

### Estado de los contenedores

```bash
docker compose ps
```

### Uso de recursos en tiempo real

```bash
docker stats
```

### Espacio en disco

```bash
df -h
docker system df
```

### Inspeccionar health checks

```bash
docker inspect pet_quotes_backend | grep -A 10 '"Health"'
docker inspect pet_quotes_frontend | grep -A 10 '"Health"'
```

### Logs del sistema (Nginx)

> **Ejecutar en:** Droplet como `appuser`

```bash
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/error.log
```

---

## PARTE 10 — Seguridad post-despliegue

### Actualizaciones automáticas de seguridad del OS

> **Ejecutar en:** Droplet como `root` (o `appuser` con `sudo`)

```bash
apt install -y unattended-upgrades

# Configura las actualizaciones automáticas (selecciona "Yes" cuando pregunte)
dpkg-reconfigure --priority=low unattended-upgrades

# Verifica que quedó activado
cat /etc/apt/apt.conf.d/20auto-upgrades
```

El archivo debe mostrar:

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

### Verificar que el .env tiene permisos correctos

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
ls -la .env
```

Debe mostrar `-rw-------` (permisos 600, propietario `appuser`). Si no:

```bash
chmod 600 .env
stat .env
```

---

## PARTE 11 — Troubleshooting

### Contenedor no arranca

> **Ejecutar en:** Droplet como `appuser`, en `/home/appuser/pet-quotes`

```bash
docker compose logs <servicio> --tail=100
# Ejemplo: docker compose logs backend --tail=100
```

### Backend unhealthy — no puede conectar a la DB

Verifica que `DATABASE_URL` en `.env` apunta al servicio `postgres-db` (no a `localhost`) y que
postgres está healthy:

```bash
docker compose ps postgres-db
docker compose logs postgres-db --tail=30
```

### Frontend no conecta al API (error de red en el navegador)

Las variables `NEXT_PUBLIC_*` se bakean en la imagen al construirla. Si cambiaron, hay que
reconstruir y redesplegar la imagen del frontend — un cambio en `.env` no es suficiente.

### Error 502 Bad Gateway en Nginx

El contenedor no está corriendo o no escucha en el puerto esperado:

```bash
docker compose ps
# Verifica que backend escucha en 127.0.0.1:3001 y frontend en 127.0.0.1:3000
```

### Certificado SSL expirado

```bash
# Ejecutar en: Droplet como appuser
sudo certbot renew
sudo systemctl reload nginx
```

### Migraciones de base de datos pendientes

```bash
# Ejecutar en: Droplet como appuser, en /home/appuser/pet-quotes
docker compose exec -T backend npx prisma migrate status
docker compose exec -T backend npx prisma migrate deploy
```

### Espacio en disco lleno

```bash
# Ejecutar en: Droplet como appuser
docker system prune -f
# ATENCIÓN: no agrega --volumes — eso borraría los datos de postgres y redis
```

### Fail2Ban bloqueó tu IP

```bash
# Ejecutar en: Droplet como root o appuser con sudo
fail2ban-client set sshd unbanip <TU_IP>
fail2ban-client status sshd
```

---

## Checklist de despliegue

### Infraestructura

- [ ] DNS propagado: `dig petquotes.online` devuelve la IP del Droplet
- [ ] DNS propagado: `dig api.petquotes.online` devuelve la IP del Droplet
- [ ] Firewall activo: `sudo ufw status` muestra `OpenSSH` y `Nginx Full`
- [ ] Fail2Ban activo: `fail2ban-client status sshd` responde correctamente

### Docker y contenedores

- [ ] `docker compose ps` muestra los 5 servicios como `Up` (o `Up (healthy)`)
- [ ] `docker compose logs backend --tail=20` sin errores críticos
- [ ] `docker compose logs frontend --tail=20` sin errores críticos
- [ ] `docker compose logs analytics-service --tail=20` sin errores críticos

### Aplicación

- [ ] `https://api.petquotes.online/api/health` devuelve `{"status":"ok"}`
- [ ] `https://petquotes.online` carga sin errores de certificado
- [ ] Login con email/contraseña funciona
- [ ] Login con OAuth (Google, GitHub, etc.) funciona
- [ ] Se puede registrar una mascota
- [ ] Las clínicas cercanas aparecen en el mapa (Google Maps)
- [ ] Los correos de confirmación llegan (Resend)

### CI/CD

- [ ] Secret `DEPLOY_SSH_KEY` configurado en GitHub
- [ ] Secret `DROPLET_HOST` configurado en GitHub
- [ ] Secret `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configurado en GitHub
- [ ] Workflow `deploy-frontend.yml` existe en `.github/workflows/`
- [ ] Workflow `deploy-backend.yml` existe en `.github/workflows/`
- [ ] Un push de prueba a `main` dispara los workflows correctamente

### Seguridad

- [ ] `.env` tiene permisos 600: `ls -la /home/appuser/pet-quotes/.env`
- [ ] Unattended-upgrades activo: `cat /etc/apt/apt.conf.d/20auto-upgrades`
- [ ] Certbot dry-run pasa: `sudo certbot renew --dry-run`
- [ ] Puertos internos NO expuestos: `sudo ufw status` no muestra 3000, 3001, 3009, 5432, 6379
