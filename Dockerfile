FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build
# outputs to /frontend/../public (root of project)

FROM node:18-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=frontend-builder /frontend/../public ./public
COPY prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/app.js"]
