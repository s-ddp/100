FROM node:18

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники
COPY . .

# Открываем порт
EXPOSE 4000

# Для продакшена:
# CMD ["npm", "start"]

# Для разработки:
CMD ["npm", "run", "dev"]
