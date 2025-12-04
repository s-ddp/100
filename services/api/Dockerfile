FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
COPY tsconfig.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY src ./src
COPY prisma ./prisma
COPY .env.example ./.env.example

RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
