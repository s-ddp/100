FROM node:20-slim AS runtime
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY public ./public
COPY server.js ./server.js

EXPOSE 3000
CMD ["node", "server.js"]
