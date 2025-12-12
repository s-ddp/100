FROM node:20-alpine

# Рабочая директория
WORKDIR /app

# 1. Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# 2. Копируем исходники и конфиг
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# 3. Собираем TypeScript -> dist
RUN npm run build

# Прод окружение
ENV NODE_ENV=production
EXPOSE 4000

# 4. Запускаем уже собранный JS
CMD ["npm", "start"]
