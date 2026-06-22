# Guía de Despliegue — Pet Quotes en DigitalOcean

**Dominio:** `petquotes.online` (frontend) · `api.petquotes.online` (backend API)
**Servidor:** Ubuntu 22.04 LTS, DigitalOcean Droplet (mínimo 2 GB RAM; recomendado 4 GB)

---

## PASO 0 — Antes de conectarte al servidor

### 0.1 Configura el DNS en Hostinger

En el panel de Hostinger, ve a **DNS Zone** de `petquotes.online` y crea estos registros:

| Tipo | Host | Valor | TTL |
|------|------|-------|-----|
| A | `@` | `<IP del Droplet>` | 3600 |
| A | `www` | `<IP del Droplet>` | 3600 |
| A | `api` | `<IP del Droplet>` | 3600 |

> Reemplaza `<IP del Droplet>` con la IP pública que aparece en tu panel de DigitalOcean.
> La propagación DNS puede tardar entre 5 y 60 minutos.

### 0.2 Prepara las credenciales OAuth

En cada consola de proveedor OAuth, agrega `https://petquotes.online/oauth/callback` como redirect URI autorizado:
- **Google:** [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → tu OAuth 2.0 Client ID
- **GitHub:** Settings → Developer settings → OAuth Apps → tu app → Authorization callback URL
- **Facebook / Microsoft:** consola equivalente

---

## PASO 1 — Primera conexión y configuración del servidor

```bash
# Conéctate como root
ssh root@<IP_DEL_DROPLET>

# Actualiza el sistema
apt update && apt upgrade -y

# Instala dependencias base
apt install -y curl git ufw nginx certbot python3-certbot-nginx

# Instala Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Instala Docker Compose plugin (v2)
apt install -y docker-compose-plugin

# Verifica versiones
docker --version
docker compose version
nginx -v
```

---

## PASO 2 — Configura el firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

> `Nginx Full` abre los puertos 80 y 443. Los puertos 3000, 3001, 5432, 6379
> NO deben abrirse — Docker los expone solo en 127.0.0.1.

---

## PASO 3 — Crea el usuario de aplicación

```bash
adduser appuser
usermod -aG docker appuser
su - appuser
```

---

## PASO 4 — Clona el repositorio

```bash
# Como appuser
git clone https://github.com/<tu-usuario>/pet-quotes.git /home/appuser/pet-quotes
cd /home/appuser/pet-quotes
```

---

## PASO 5 — Configura las variables de entorno

Crea el archivo `.env` en la raíz del repositorio. **Este archivo NUNCA va a git.**

```bash
nano /home/appuser/pet-quotes/.env
```

Pega y rellena el siguiente contenido (copia de `backend/.env.example` como base):

```env
# Database
DATABASE_USER=pet_quotes
DATABASE_PASSWORD=<contraseña_fuerte>
DATABASE_NAME=pet_quotes_db
DATABASE_URL=postgresql://pet_quotes:<contraseña_fuerte>@postgres-db:5432/pet_quotes_db

# JWT — genera con: openssl rand -hex 32
JWT_SECRET=<secreto_jwt_largo_aleatorio>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# App
NODE_ENV=production
APP_PORT=3001
FRONTEND_URL=https://petquotes.online

# OAuth — Google
OAUTH_GOOGLE_CLIENT_ID=<id_de_google>
OAUTH_GOOGLE_CLIENT_SECRET=<secreto_de_google>

# OAuth — GitHub (añade más providers si los usas)
OAUTH_GITHUB_CLIENT_ID=<id_de_github>
OAUTH_GITHUB_CLIENT_SECRET=<secreto_de_github>

# OAuth — Facebook
OAUTH_FACEBOOK_CLIENT_ID=<id_de_facebook>
OAUTH_FACEBOOK_CLIENT_SECRET=<secreto_de_facebook>

# OAuth — Microsoft
OAUTH_MICROSOFT_CLIENT_ID=<id_de_microsoft>
OAUTH_MICROSOFT_CLIENT_SECRET=<secreto_de_microsoft>

# OAuth state secret — genera con: openssl rand -hex 32
OAUTH_STATE_SECRET=<secreto_oauth_state>

# Callback URLs
GOOGLE_CALLBACK_URL=https://petquotes.online/oauth/callback
GITHUB_CALLBACK_URL=https://petquotes.online/oauth/callback
FACEBOOK_CALLBACK_URL=https://petquotes.online/oauth/callback
MICROSOFT_CALLBACK_URL=https://petquotes.online/oauth/callback

# Email (Resend)
RESEND_API_KEY=re_<tu_clave_resend>
RESEND_FROM_EMAIL=noreply@petquotes.online

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<tu_clave_google_maps>
GOOGLE_MAPS_API_KEY=<tu_clave_google_maps>

# Frontend public vars (también necesarias para el docker build)
NEXT_PUBLIC_API_BASE_URL=https://api.petquotes.online
NEXT_PUBLIC_API_URL=https://api.petquotes.online
NEXT_PUBLIC_API_TIMEOUT_MS=10000

# Server-side proxy vars
API_BASE_URL=http://backend:3001
JWT_ACCESS_SECRET=<mismo_valor_que_JWT_SECRET>
API_PROXY_TIMEOUT_MS=8000

# PgAdmin (si lo necesitas puntualmente vía SSH tunnel)
PGADMIN_EMAIL=admin@petquotes.online
PGADMIN_PASSWORD=<contraseña_pgadmin>
```

> **Genera contraseñas y secretos fuertes:**
> ```bash
> openssl rand -hex 32   # para JWT_SECRET, OAUTH_STATE_SECRET
> openssl rand -base64 24  # para contraseñas de DB / PgAdmin
> ```

---

## PASO 6 — Configura Nginx

```bash
# Como root o con sudo desde appuser
sudo cp /home/appuser/pet-quotes/nginx/petquotes.conf /etc/nginx/sites-available/petquotes
sudo ln -s /etc/nginx/sites-available/petquotes /etc/nginx/sites-enabled/petquotes

# Elimina el site por defecto si existe
sudo rm -f /etc/nginx/sites-enabled/default

# Valida la configuración
sudo nginx -t

# Recarga Nginx
sudo systemctl reload nginx
```

---

## PASO 7 — Activa HTTPS con Certbot

> Espera a que el DNS haya propagado antes de este paso (verifica con `dig petquotes.online`).

```bash
sudo certbot --nginx -d petquotes.online -d www.petquotes.online -d api.petquotes.online \
  --non-interactive --agree-tos -m tu@email.com
```

Certbot actualiza automáticamente el archivo `/etc/nginx/sites-available/petquotes` con los bloques SSL y añade un cron de renovación automática. Verifica:

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot renew --dry-run
```

---

## PASO 8 — Construye y levanta los contenedores

```bash
cd /home/appuser/pet-quotes

# Construye las imágenes (tarda ~5-10 min en el primer build)
docker compose build

# Levanta todos los servicios en background
docker compose up -d

# Verifica que todos estén corriendo
docker compose ps

# Sigue los logs (Ctrl+C para salir, no detiene los contenedores)
docker compose logs -f
```

---

## PASO 9 — Aplica las migraciones de base de datos

```bash
# Espera ~30 segundos a que postgres y el backend terminen de inicializarse
docker compose exec backend npx prisma migrate deploy
```

> **No ejecutes `prisma migrate dev`** en producción — eso crea migraciones nuevas.
> `prisma migrate deploy` solo aplica las migraciones ya existentes en `backend/prisma/migrations/`.

---

## PASO 10 — Verifica el despliegue

```bash
# Health check del backend
curl https://api.petquotes.online/api/health

# Accede al frontend
curl -I https://petquotes.online

# Verifica logs de cada servicio
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
docker compose logs analytics-service --tail=50
```

Abre `https://petquotes.online` en el navegador. Si ves la app, el despliegue fue exitoso.

---

## OPERACIONES FRECUENTES

### Actualizar la aplicación (nueva versión)

```bash
cd /home/appuser/pet-quotes
git pull
docker compose build
docker compose up -d
# Si hay migraciones nuevas:
docker compose exec backend npx prisma migrate deploy
```

### Ver logs en tiempo real

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Reiniciar un servicio específico

```bash
docker compose restart backend
```

### Backup de la base de datos

```bash
docker compose exec postgres-db pg_dump \
  -U pet_quotes pet_quotes_db > backup-$(date +%Y%m%d).sql
```

### Restaurar un backup

```bash
cat backup-20260621.sql | docker compose exec -T postgres-db \
  psql -U pet_quotes pet_quotes_db
```

### Acceder a PgAdmin (vía SSH tunnel — nunca expongas el puerto directamente)

En el droplet, añade temporalmente pgadmin a docker-compose o usa:

```bash
# En tu máquina local:
ssh -L 5050:127.0.0.1:5050 appuser@<IP_DEL_DROPLET>
# Luego abre http://localhost:5050 en el navegador
```

Para levantar pgadmin temporalmente en el server, añade al docker-compose:
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

Después: `docker compose up -d pgadmin` y usa el tunnel SSH para acceder.

---

## CHECKLIST FINAL

- [ ] DNS propagado: `dig petquotes.online` devuelve la IP del Droplet
- [ ] `https://petquotes.online` carga sin errores de certificado
- [ ] `https://api.petquotes.online/api/health` devuelve `{"status":"ok"}`
- [ ] Login con email/contraseña funciona
- [ ] Login con OAuth (Google, etc.) funciona
- [ ] Se puede registrar una mascota
- [ ] Las clínicas cercanas aparecen en el mapa
- [ ] Los correos de confirmación llegan (Resend)
- [ ] `docker compose ps` muestra todos los servicios como `Up (healthy)`
