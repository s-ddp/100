# --- BUILD STAGE ---
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости без lock-файла
RUN npm install

COPY tsconfig.json ./
COPY src ./src

# Компиляция в dist
RUN npm run build



# --- RUNTIME STAGE ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Устанавливаем ТОЛЬКО продакшн зависимости
RUN npm install --omit=dev

# Копируем собранный код
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
