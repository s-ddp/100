FROM node:20-slim

WORKDIR /app

# 1. Системные зависимости для Prisma
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# 2. package.json
COPY package.json ./
RUN npm install

# 3. Prisma
COPY prisma ./prisma
RUN npx prisma generate

# 4. Исходники
COPY tsconfig.json ./
COPY src ./src

# 5. Build
RUN npm run build

# 6. Start
CMD ["node", "dist/index.js"]
