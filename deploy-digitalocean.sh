#!/bin/bash

###############################################################################
# PET QUOTES - SCRIPT DE DESPLIEGUE EN DIGITAL OCEAN
# 
# Uso: sudo bash deploy-digitalocean.sh
# 
# Este script automatiza la instalación y configuración de la aplicación
# Pet Quotes en un Droplet de Digital Ocean (Ubuntu 22.04 LTS)
###############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APPUSER="appuser"
APPDIR="/home/$APPUSER/pet-quotes"
REPO_URL="https://github.com/tu-usuario/pet-quotes.git"  # CAMBIAR

###############################################################################
# FUNCIONES
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script debe ejecutarse como root (sudo)"
        exit 1
    fi
}

###############################################################################
# FASE 1: ACTUALIZAR SISTEMA
###############################################################################

phase_system_update() {
    log_info "=== FASE 1: Actualizando sistema ==="
    apt-get update
    apt-get upgrade -y
    log_success "Sistema actualizado"
}

###############################################################################
# FASE 2: INSTALAR DEPENDENCIAS
###############################################################################

phase_install_dependencies() {
    log_info "=== FASE 2: Instalando dependencias ==="
    
    apt-get install -y \
        build-essential \
        curl \
        wget \
        git \
        htop \
        vim \
        postgresql-client \
        nginx \
        certbot \
        python3-certbot-nginx
    
    log_success "Dependencias del sistema instaladas"
}

###############################################################################
# FASE 3: INSTALAR NODE.JS & NPM
###############################################################################

phase_install_nodejs() {
    log_info "=== FASE 3: Instalando Node.js 20 LTS ==="
    
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    # Verificar
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    
    log_success "Node.js $NODE_VERSION y NPM $NPM_VERSION instalados"
}

###############################################################################
# FASE 4: INSTALAR DOCKER
###############################################################################

phase_install_docker() {
    log_info "=== FASE 4: Instalando Docker & Docker Compose ==="
    
    # Instalar Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    bash get-docker.sh
    
    # Instalar Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Verificar
    DOCKER_VERSION=$(docker --version)
    COMPOSE_VERSION=$(docker-compose --version)
    
    log_success "Docker $DOCKER_VERSION instalado"
    log_success "Docker Compose $COMPOSE_VERSION instalado"
}

###############################################################################
# FASE 5: CREAR USUARIO APPUSER
###############################################################################

phase_create_appuser() {
    log_info "=== FASE 5: Creando usuario $APPUSER ==="
    
    # Crear usuario si no existe
    if ! id "$APPUSER" &>/dev/null; then
        adduser --disabled-password --gecos "" $APPUSER
        usermod -aG sudo $APPUSER
        usermod -aG docker $APPUSER
        log_success "Usuario $APPUSER creado"
    else
        log_warning "Usuario $APPUSER ya existe"
    fi
}

###############################################################################
# FASE 6: CONFIGURAR FIREWALL
###############################################################################

phase_configure_firewall() {
    log_info "=== FASE 6: Configurando Firewall ==="
    
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp  # Frontend
    ufw allow 3001/tcp  # Backend
    ufw allow 5050/tcp  # PgAdmin
    
    log_success "Firewall configurado"
}

###############################################################################
# FASE 7: CLONAR REPOSITORIO
###############################################################################

phase_clone_repository() {
    log_info "=== FASE 7: Clonando repositorio ==="
    
    if [ ! -d "$APPDIR" ]; then
        log_warning "IMPORTANTE: Edita el REPO_URL en este script antes de continuar"
        log_warning "Línea 40: REPO_URL=\"https://github.com/tu-usuario/pet-quotes.git\""
        read -p "¿Deseas continuar? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            sudo -u $APPUSER git clone $REPO_URL $APPDIR
            log_success "Repositorio clonado"
        else
            log_error "Operación cancelada"
            exit 1
        fi
    else
        log_warning "Directorio $APPDIR ya existe"
    fi
}

###############################################################################
# FASE 8: CREAR .ENV
###############################################################################

phase_create_env() {
    log_info "=== FASE 8: Creando archivo .env ==="
    
    if [ ! -f "$APPDIR/.env" ]; then
        log_warning "IMPORTANTE: Configura el archivo .env manualmente en:"
        log_warning "$APPDIR/.env"
        log_warning ""
        log_warning "Template .env:"
        cat << 'EOF'

# === DATABASE ===
DATABASE_URL="postgresql://pet_quotes:CHANGE_PASSWORD@postgres-db:5432/pet_quotes_db"
DATABASE_USER="pet_quotes"
DATABASE_PASSWORD="CHANGE_PASSWORD"
DATABASE_NAME="pet_quotes_db"

# === JWT ===
JWT_SECRET="GENERATE_RANDOM_SECRET_64_CHARS_MIN"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# === APP ===
NODE_ENV="production"
APP_PORT="3001"
APP_NAME="Pet Quotes API"

# === FRONTEND ===
FRONTEND_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# === OAUTH ===
OAUTH_GOOGLE_CLIENT_ID="xxxxx"
OAUTH_GOOGLE_CLIENT_SECRET="xxxxx"
OAUTH_FACEBOOK_CLIENT_ID="xxxxx"
OAUTH_FACEBOOK_CLIENT_SECRET="xxxxx"

# === EMAIL ===
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="app_password"

# === REDIS ===
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_DB="0"

# === MAPS ===
GOOGLE_MAPS_API_KEY="xxxxx"

# === PGADMIN ===
PGADMIN_EMAIL="admin@domain.com"
PGADMIN_PASSWORD="STRONG_PASSWORD"

EOF
        log_warning "Presiona Enter cuando hayas configurado el .env..."
        read
    else
        log_success ".env ya existe"
    fi
}

###############################################################################
# FASE 9: INICIAR DOCKER COMPOSE
###############################################################################

phase_start_docker() {
    log_info "=== FASE 9: Iniciando Docker Compose ==="
    
    cd $APPDIR
    
    # Crear archivo docker-compose.prod.yml si no existe
    if [ ! -f "docker-compose.prod.yml" ]; then
        log_warning "Usando docker-compose.yml estándar"
        COMPOSE_FILE="docker-compose.yml"
    else
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    docker-compose -f $COMPOSE_FILE up -d
    
    # Esperar a que PostgreSQL esté listo
    log_info "Esperando a que PostgreSQL esté listo..."
    sleep 30
    
    log_success "Docker Compose iniciado"
}

###############################################################################
# FASE 10: EJECUTAR MIGRACIONES
###############################################################################

phase_run_migrations() {
    log_info "=== FASE 10: Ejecutando migraciones de BD ==="
    
    cd $APPDIR
    
    docker-compose -f ${COMPOSE_FILE:-docker-compose.yml} exec -T backend npm run prisma:migrate:deploy
    docker-compose -f ${COMPOSE_FILE:-docker-compose.yml} exec -T backend npm run prisma:seed
    
    log_success "Migraciones ejecutadas"
}

###############################################################################
# FASE 11: CONFIGURAR NGINX
###############################################################################

phase_configure_nginx() {
    log_info "=== FASE 11: Configurando Nginx ==="
    
    log_warning "IMPORTANTE: Edita manualmente los archivos:"
    log_warning "/etc/nginx/sites-available/api.yourdomain.com"
    log_warning "/etc/nginx/sites-available/yourdomain.com"
    log_warning ""
    log_warning "Template para API:"
    cat << 'EOF'

upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

EOF
    
    log_warning "Template para Frontend:"
    cat << 'EOF'

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
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
    
    log_warning "Presiona Enter cuando hayas configurado los archivos de Nginx..."
    read
    
    nginx -t
    systemctl reload nginx
    
    log_success "Nginx configurado"
}

###############################################################################
# FASE 12: SSL CON LET'S ENCRYPT
###############################################################################

phase_setup_ssl() {
    log_info "=== FASE 12: Configurando SSL/TLS ==="
    
    log_warning "¿Deseas configurar SSL ahora? (s/n)"
    read -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
        systemctl enable certbot.timer
        systemctl start certbot.timer
        log_success "SSL configurado"
    else
        log_warning "SSL saltado. Configura manualmente después."
    fi
}

###############################################################################
# FASE 13: VERIFICACIÓN FINAL
###############################################################################

phase_final_verification() {
    log_info "=== FASE 13: Verificación Final ==="
    
    cd $APPDIR
    
    log_info "Estado de servicios:"
    docker-compose -f ${COMPOSE_FILE:-docker-compose.yml} ps
    
    log_info "Verificando endpoints..."
    sleep 5
    
    curl -I http://localhost:3000 2>/dev/null | head -1
    curl -I http://localhost:3001/health 2>/dev/null | head -1
    
    log_success "¡Despliegue completado!"
}

###############################################################################
# MENÚ PRINCIPAL
###############################################################################

main() {
    clear
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║     PET QUOTES - SCRIPT DE DESPLIEGUE EN DIGITAL OCEAN          ║
║                                                                  ║
║  Este script configurará automáticamente tu Droplet             ║
╚══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    check_root
    
    # Ejecutar fases
    phase_system_update
    phase_install_dependencies
    phase_install_nodejs
    phase_install_docker
    phase_create_appuser
    phase_configure_firewall
    phase_clone_repository
    phase_create_env
    phase_start_docker
    phase_run_migrations
    phase_configure_nginx
    phase_setup_ssl
    phase_final_verification
    
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║          ¡DESPLIEGUE EXITOSO!                         ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "Próximos pasos:"
    log_info "1. Verifica que los servicios estén corriendo:"
    log_info "   docker-compose ps"
    log_info ""
    log_info "2. Visualiza los logs:"
    log_info "   docker-compose logs -f backend"
    log_info ""
    log_info "3. Accede a la aplicación:"
    log_info "   https://yourdomain.com"
    log_info "   https://api.yourdomain.com"
}

# Ejecutar
main "$@"
