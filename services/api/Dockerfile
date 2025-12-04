FROM node:20-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY src ./src
COPY prisma ./prisma
COPY .env.example ./.env.example

RUN npm run build
RUN npm prune --omit=dev

EXPOSE 4000
CMD ["node", "dist/index.js"]
