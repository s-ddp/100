FROM node:20-slim AS runtime
WORKDIR /app
COPY public ./public
COPY server.js ./server.js
EXPOSE 3000
CMD ["node", "server.js"]
