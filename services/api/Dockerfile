FROM node:20-bullseye AS builder
WORKDIR /app

# 🔴 КЛЮЧЕВОЕ
ENV PRISMA_SKIP_POSTINSTALL=1

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build
RUN npx prisma generate

# ------------------------

FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_SKIP_POSTINSTALL=1

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

CMD ["node", "dist/index.js"]
