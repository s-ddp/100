FROM node:20-bullseye

WORKDIR /app

# npm network hardening
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 10 \
 && npm config set fetch-retry-factor 3 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 180000

# deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

# ⬇️ КРИТИЧЕСКИ ВАЖНО
# копируем ВЕСЬ src, включая shims
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./

# build
RUN npx prisma generate
RUN npm run build

# runtime
EXPOSE 4000
CMD ["node", "dist/index.js"]
