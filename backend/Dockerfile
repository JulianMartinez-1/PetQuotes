# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci

# Copy source code
COPY backend ./backend

# Generate Prisma client before build
WORKDIR /app/backend
RUN npx prisma generate

# Build backend
RUN npx tsc -p tsconfig.json && npx tsc-alias -p tsconfig.json

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma and wget for health check (Alpine uses apk)
RUN apk add --no-cache openssl wget

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh

# Generate Prisma client
RUN npx prisma generate

RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

# Health check
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=20s \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
