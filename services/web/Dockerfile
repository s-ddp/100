FROM node:20-alpine

WORKDIR /app

# 1. Копируем ТОЛЬКО package.json (lock-файла НЕТ — и это НОРМАЛЬНО)
COPY package.json ./

# 2. Устанавливаем зависимости (next ОБЯЗАН быть в dependencies)
RUN npm install

# 3. Копируем остальной код
COPY . .

# 4. Билдим Next.js
RUN npm run build

# 5. Запуск
EXPOSE 3000
CMD ["npm", "start"]
