# ── Stage 1: Build backend ────────────────────────────────
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 2: Build frontend ───────────────────────────────
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Build outputs to /frontend/dist
RUN npm run build

# ── Stage 3: Production runner ────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

# Production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Backend compiled output
COPY --from=backend-builder /app/dist ./dist

# Prisma client
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma

# Frontend static files served by Express
COPY --from=frontend-builder /frontend/dist ./public

# Prisma schema (for migrations)
COPY prisma ./prisma

EXPOSE 3000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
