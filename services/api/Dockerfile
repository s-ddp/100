# --- BUILD STAGE ---
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json (без необходимости иметь package-lock.json)
COPY package*.json ./

# Устанавливаем зависимости через npm install (не ci)
RUN npm install

# Копируем исходники
COPY tsconfig.json ./
COPY src ./src

# Компиляция TypeScript -> dist/
RUN npm run build



# --- RUNTIME STAGE ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Установка только production зависимостей
RUN npm install --omit=dev

# Копируем скомпилированный dist
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
