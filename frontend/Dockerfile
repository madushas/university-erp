# Multi-stage Dockerfile for Next.js frontend
# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

# Enable corepack to use pnpm
RUN corepack enable

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
RUN pnpm approve-builds 

# Copy sources and build
COPY . .
RUN pnpm build && pnpm prune --prod

# Runner stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copy built artifacts and production deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "start"]
