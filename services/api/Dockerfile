# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

COPY package.json ./
RUN npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-factor 2 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && (npm ci --no-audit --no-fund || npm install --no-audit --no-fund)

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
RUN npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-factor 2 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && (npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund)

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/index.js"]
