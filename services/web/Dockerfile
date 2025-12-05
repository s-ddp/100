FROM node:20-alpine

WORKDIR /app

# копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# ставим зависимости
RUN npm install

# копируем всё содержимое web-папки
COPY . .

# открываем порт
EXPOSE 3000

CMD ["npm", "run", "dev"]
