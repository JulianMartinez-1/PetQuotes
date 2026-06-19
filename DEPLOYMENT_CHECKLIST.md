# ⚡ CHECKLIST DESPLIEGUE DIGITAL OCEAN - PET QUOTES

> Guía rápida de verificación antes de desplegar en producción

---

## 📋 PRE-REQUISITOS (Antes de empezar)

### Dominio & DNS
- [ ] Dominio principal registrado (ej: petquotes.com)
- [ ] Subdominio API creado (ej: api.petquotes.com)
- [ ] Records A configurados en DNS
  ```
  petquotes.com     A  [IP_DEL_DROPLET]
  api.petquotes.com A  [IP_DEL_DROPLET]
  www.petquotes.com A  [IP_DEL_DROPLET]
  ```
- [ ] TTL reducido a 300-600 segundos

### Repositorio Git
- [ ] Código en GitHub público o privado
- [ ] `.env` en `.gitignore` ✓
- [ ] `.env.example` con template (SIN secretos)
- [ ] README.md actualizado
- [ ] LICENSE incluida

### Credenciales & Secretos
- [ ] JWT_SECRET generado (32+ caracteres)
  ```bash
  # Generar en terminal local:
  openssl rand -hex 32
  ```
- [ ] DATABASE_PASSWORD fuerte (32+ caracteres)
- [ ] OAUTH_GOOGLE_CLIENT_ID obtenido
- [ ] OAUTH_GOOGLE_CLIENT_SECRET obtenido
- [ ] SMTP configurado (Gmail/SendGrid/etc)
- [ ] GOOGLE_MAPS_API_KEY válida

### Recursos
- [ ] Droplet creado en Digital Ocean
  - [ ] Ubuntu 22.04 LTS
  - [ ] 4 GB RAM (mínimo) o 8 GB (recomendado)
  - [ ] 2 vCPU
  - [ ] 80 GB SSD (mínimo)
  - [ ] Backups habilitados
  - [ ] IPv4 pública asignada

---

## 🚀 FASE 1: PROVISIÓN DEL DROPLET (30 minutos)

### 1.1 Crear Droplet
```
☐ Seleccionar región más cercana a usuarios
☐ Elegir Ubuntu 22.04 LTS
☐ Seleccionar plan 4 GB RAM
☐ Habilitar backups automáticos
☐ Habilitar IPv6 (opcional)
☐ Anotar IP pública
```

### 1.2 SSH Inicial
```bash
☐ ssh root@YOUR_DROPLET_IP
☐ apt-get update
☐ apt-get upgrade -y
☐ Crear usuario: adduser appuser
☐ Agregar sudo: usermod -aG sudo appuser
☐ Probar sudo: sudo whoami (sin contraseña)
```

---

## 📦 FASE 2: INSTALACIÓN DE SOFTWARE (25 minutos)

### Opción A: Script Automático ✅ RECOMENDADO
```bash
☐ Descargar script: deploy-digitalocean.sh
☐ Editar REPO_URL en línea 40
☐ chmod +x deploy-digitalocean.sh
☐ sudo bash deploy-digitalocean.sh
```

### Opción B: Instalación Manual
```bash
# Node.js
☐ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
☐ sudo apt-get install -y nodejs

# Docker
☐ curl -fsSL https://get.docker.com -o get-docker.sh
☐ bash get-docker.sh
☐ sudo usermod -aG docker appuser

# Nginx + SSL
☐ sudo apt-get install -y nginx certbot python3-certbot-nginx

# Herramientas
☐ sudo apt-get install -y git postgresql-client htop vim

# Verificar instalaciones
☐ node --version (debe ser v20.x.x)
☐ npm --version (debe ser 10.x.x)
☐ docker --version
☐ docker-compose --version
☐ nginx -v
```

---

## 🔐 FASE 3: SEGURIDAD (20 minutos)

### Firewall
```bash
☐ sudo ufw --force enable
☐ sudo ufw allow 22/tcp
☐ sudo ufw allow 80/tcp
☐ sudo ufw allow 443/tcp
☐ sudo ufw allow 3000/tcp (frontend)
☐ sudo ufw allow 3001/tcp (backend)
☐ sudo ufw status (verificar)
```

### SSH Hardening
```bash
☐ Crear SSH key localmente: ssh-keygen -t ed25519
☐ Copiar key al Droplet: ssh-copy-id -i ~/.ssh/id_ed25519.pub appuser@IP
☐ Desabilitar root SSH
☐ Desabilitar password auth (solo SSH keys)
```

---

## 🗂️ FASE 4: DESPLIEGUE DE CÓDIGO (15 minutos)

### Clonar Repositorio
```bash
☐ sudo -u appuser git clone https://github.com/usuario/pet-quotes.git /home/appuser/pet-quotes
☐ cd /home/appuser/pet-quotes
```

### Crear .env
```bash
☐ Copiar .env.example a .env
☐ Editar .env con valores de producción
☐ chmod 600 .env (solo readable por appuser)

Valores críticos:
☐ DATABASE_URL = "postgresql://pet_quotes:PASSWORD@postgres-db:5432/pet_quotes_db"
☐ JWT_SECRET = "GENERATED_RANDOM_HEX_STRING"
☐ NODE_ENV = "production"
☐ FRONTEND_URL = "https://yourdomain.com"
☐ NEXT_PUBLIC_API_URL = "https://api.yourdomain.com"
```

---

## 🐳 FASE 5: DOCKER COMPOSE (10 minutos)

### Iniciar Servicios
```bash
☐ cd /home/appuser/pet-quotes
☐ docker-compose up -d

# Esperar 30 segundos para que PostgreSQL esté listo
☐ sleep 30

# Verificar estado
☐ docker-compose ps

# Debe mostrar:
  - postgres-db: healthy ✓
  - backend: healthy ✓
  - frontend: healthy ✓
  - redis: healthy ✓
  - pgadmin: healthy ✓
```

---

## 🗄️ FASE 6: BASE DE DATOS (10 minutos)

### Ejecutar Migraciones
```bash
☐ docker-compose exec backend npm run prisma:migrate:deploy

# Debe mostrar: Migrations to apply: 1, 2, 3... ✓
```

### Seed (Crear Admin)
```bash
☐ docker-compose exec backend npm run prisma:seed

# Debe mostrar:
  ✨ Usuario admin creado exitosamente!
  📧 Email: admin@petquotes.local
  🔐 Password: Admin@123456
  👤 Nombre: Administrador
```

---

## 🌐 FASE 7: NGINX & SSL (15 minutos)

### Crear Configuración Nginx

#### Para API (api.yourdomain.com)
```bash
☐ sudo tee /etc/nginx/sites-available/api.yourdomain.com << 'EOF'
upstream backend {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

☐ sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
```

#### Para Frontend (yourdomain.com)
```bash
☐ sudo tee /etc/nginx/sites-available/yourdomain.com << 'EOF'
upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

☐ sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
```

### Validar & Recargar
```bash
☐ sudo nginx -t (debe decir "test successful")
☐ sudo systemctl reload nginx
☐ sudo systemctl enable nginx
```

### SSL con Let's Encrypt
```bash
☐ sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
☐ Seleccionar "Redirect" (opción 2)
☐ sudo systemctl enable certbot.timer
☐ sudo systemctl start certbot.timer

# Verificar
☐ sudo systemctl status certbot.timer
☐ curl -I https://yourdomain.com (debe devolver 200 OK)
```

---

## ✅ FASE 8: VERIFICACIÓN FINAL

### Test de Conectividad
```bash
☐ curl -I https://yourdomain.com (debe ser 200)
☐ curl -I https://api.yourdomain.com/health (debe ser 200)
☐ Visitar en navegador: https://yourdomain.com
☐ Intentar login con admin@petquotes.local / Admin@123456
```

### Verificar Logs
```bash
☐ docker-compose logs --tail=50 backend
☐ docker-compose logs --tail=50 frontend
☐ sudo journalctl -u nginx -n 20
☐ sudo tail -f /var/log/syslog (errores del sistema)
```

### Monitoreo
```bash
☐ docker stats (verificar uso de CPU/RAM)
☐ df -h (espacio en disco)
☐ free -h (memoria disponible)
```

---

## 🔧 POST-DESPLIEGUE

### Backups
```bash
☐ Habilitar snapshots diarios en DO
☐ Configurar backup de BD en Managed Database (opcional)
☐ Documentar procedimiento de restore
```

### Monitoreo Continuo
```bash
☐ Habilitar email alerts en DO
☐ Configurar uptime monitoring (StatusPage, Pingdom, etc)
☐ Agregar logging centralizado (opcional)
```

### Documentación
```bash
☐ Guardar IPs y credenciales en lugar seguro
☐ Documentar acceso SSH
☐ Documentar contraseñas de .env
☐ Guardar copia de SSH keys
```

---

## 🆘 TROUBLESHOOTING

### Backend no inicia
```bash
# Revisar logs
docker-compose logs backend

# Problemas comunes:
- ❌ DATABASE_URL mal configurada
  ✅ Verificar: postgresql://user:pass@postgres-db:5432/db

- ❌ Prisma schema out of sync
  ✅ Solución: docker-compose exec backend npm run prisma:generate

- ❌ Migraciones no ejecutadas
  ✅ Solución: docker-compose exec backend npm run prisma:migrate:deploy
```

### Frontend muestra error 502
```bash
# Nginx error
sudo nginx -t
sudo systemctl reload nginx

# Backend down?
docker-compose ps backend

# No connectivity?
docker-compose logs frontend
```

### PostgreSQL no inicia
```bash
# Esperamos 30-60 segundos
docker-compose logs postgres-db

# Reset BD (PELIGRO - borra datos!)
docker-compose down -v
docker-compose up -d postgres-db
# Esperar health check
docker-compose exec backend npm run prisma:migrate:deploy
```

### Certificado SSL expira
```bash
# Renovar manual
sudo certbot renew --force-renewal

# Auto-renewal debe estar activo
sudo systemctl status certbot.timer
```

---

## 📊 RECURSOS & MONITOREO

### Dashboard Digital Ocean
- Acceder a: https://cloud.digitalocean.com
- Revisar: Droplet metrics, bandwidth usage
- Alertas: CPU > 80%, Disk > 90%

### Verificar Servicios
```bash
# PostgreSQL
docker-compose exec postgres-db psql -U pet_quotes -d pet_quotes_db -c "SELECT COUNT(*) FROM users;"

# Redis
docker-compose exec redis redis-cli ping

# Nginx
sudo systemctl status nginx

# Systemd
systemctl status docker
systemctl status nginx
```

---

## 🎯 PRÓXIMOS PASOS

1. **Primeras 24 horas:**
   - Monitorear logs
   - Probar todas las funciones principales
   - Verificar backups

2. **Primera semana:**
   - Optimizar performance (si es necesario)
   - Configurar CDN (Cloudflare gratuito)
   - Habilitar email notifications

3. **Mantenimiento continuo:**
   - Updates mensuales de sistema
   - Backups automáticos
   - Rotación de secretos cada 90 días
   - Monitoreo de seguridad

---

## 📞 CONTACTOS & RECURSOS

**Documentación Oficial:**
- NestJS: https://docs.nestjs.com/deployment
- Next.js: https://nextjs.org/docs/deployment
- Prisma: https://www.prisma.io/docs/guides/deployment
- Docker: https://docs.docker.com
- DO Docs: https://docs.digitalocean.com

**Soporte Digital Ocean:**
- Panel de control: https://cloud.digitalocean.com
- Documentación: https://docs.digitalocean.com
- Community: https://www.digitalocean.com/community

---

**Última actualización:** 2026-06-18  
**Versión:** 1.0  
**Estado:** Listo para producción ✅
