# -----------------------
# Base Image
# -----------------------
FROM node:20-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# -----------------------
# Dependencies
# -----------------------
FROM base AS deps
WORKDIR /app

# Required for some native modules
RUN apk add --no-cache libc6-compat

# Enable pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# -----------------------
# Development
# -----------------------
FROM base AS dev
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

# Install all dependencies for development
RUN pnpm install --frozen-lockfile

# Default command for dev stage when used directly
CMD ["corepack", "pnpm", "dev", "--hostname", "0.0.0.0"]

# -----------------------
# Builder
# -----------------------
FROM base AS builder
WORKDIR /app

RUN corepack enable

COPY . .

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Build Next.js app
RUN pnpm exec next build

# -----------------------
# Runner (Production)
# -----------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user (SECURITY)
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

# Install curl for healthcheck
RUN apk add --no-cache curl libc6-compat

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Fix permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Healthcheck (PROPER)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl -f http://localhost:3000 || exit 1

# Start app
CMD ["node", "server.js"]