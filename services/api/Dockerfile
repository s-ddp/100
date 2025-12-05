# Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy workspace manifests so we can use the root lockfile
COPY package.json package-lock.json ./
COPY services/api/package.json ./services/api/package.json
COPY services/api/tsconfig.json ./services/api/tsconfig.json
COPY services/api/prisma ./services/api/prisma
COPY services/api/src ./services/api/src

# Install only the API workspace
RUN npm ci --workspace services/api --include-workspace-root=false

WORKDIR /usr/src/app/services/api
RUN npm run build
RUN npm prune --omit=dev --workspace services/api --include-workspace-root=false

# Runtime image
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app/services/api

COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=builder /usr/src/app/services/api/dist ./dist
COPY --from=builder /usr/src/app/services/api/prisma ./prisma
COPY --from=builder /usr/src/app/services/api/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/index.js"]
