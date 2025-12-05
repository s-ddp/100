# --- BUILD IMAGE ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Устанавливаем только prod deps
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Сборка TypeScript → dist/
RUN npm run build


# --- RUNTIME IMAGE ---
FROM node:20-alpine

WORKDIR /app

# Копируем только нужное (dist и prod-зависимости)
COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
