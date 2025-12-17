# services/api/Dockerfile
# PROD-ready Dockerfile для Node + TypeScript + Prisma

FROM node:20-bullseye

WORKDIR /app

ENV NODE_ENV=production
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# npm config (устойчиво к сетевым сбоям)
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 10 \
 && npm config set fetch-retry-factor 3 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 180000 \
 && npm config set audit false \
 && npm config set fund false

# 1️⃣ Копируем зависимости
COPY package.json package-lock.json* ./

# 2️⃣ Ставим зависимости БЕЗ postinstall
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund --ignore-scripts; \
    else \
      npm install --no-audit --no-fund --ignore-scripts; \
    fi

# 3️⃣ Копируем исходники
COPY . .

# 4️⃣ Генерируем Prisma Client (НА BUILD!)
RUN npx prisma generate

# 5️⃣ Собираем TypeScript
RUN npm run build

EXPOSE 4000

# 🚀 PROD-запуск (БЕЗ prisma, БЕЗ npm)
CMD ["node", "dist/index.js"]
