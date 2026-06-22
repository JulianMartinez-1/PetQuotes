# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source
COPY frontend ./

# Build-time public env vars (baked into the Next.js bundle)
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
ARG NEXT_PUBLIC_API_TIMEOUT_MS=10000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_TIMEOUT_MS=$NEXT_PUBLIC_API_TIMEOUT_MS

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init wget

# Copy package files
COPY --from=builder /app/frontend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy frontend build output and public files
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/next.config.mjs ./
COPY --from=builder /app/frontend/app ./app

# Set environment for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
