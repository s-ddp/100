# Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy workspace manifests so we can leverage the root lockfile
COPY package.json package-lock.json ./
COPY services/web/package.json ./services/web/package.json
COPY services/web/next.config.mjs ./services/web/next.config.mjs
COPY services/web/app ./services/web/app
COPY services/web/public ./services/web/public

RUN npm ci --workspace services/web --include-workspace-root=false

WORKDIR /usr/src/app/services/web
RUN npm run build

# Runtime stage
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app/services/web

COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=builder /usr/src/app/services/web/.next ./.next
COPY --from=builder /usr/src/app/services/web/package.json ./package.json
COPY --from=builder /usr/src/app/services/web/public ./public
COPY --from=builder /usr/src/app/services/web/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npm", "run", "start"]
