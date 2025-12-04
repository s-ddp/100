FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY src ./src
COPY .env.example ./.env.example

EXPOSE 4000
CMD ["node", "src/index.js"]
