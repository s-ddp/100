# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
