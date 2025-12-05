FROM node:20-alpine

WORKDIR /app

# Копируем package.json и lock-файл
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

COPY tsconfig.json ./
COPY src ./src

# Открываем порт API
EXPOSE 4000

# Запуск в dev режиме (ts-node или nodemon)
CMD ["npm", "run", "dev"]
