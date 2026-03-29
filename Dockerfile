# -----------------------
# Base Image
# -----------------------
FROM node:20-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

# -----------------------
# Dependencies
# -----------------------
FROM base AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

# -----------------------
# Builder
# -----------------------
FROM base AS builder
WORKDIR /app

COPY . .

# Reinstall full deps for build
RUN corepack enable && pnpm install --frozen-lockfile

# Build app
RUN pnpm exec next build

# -----------------------
# Runner (Production)
# -----------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Non-root user (SECURITY)
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

# Copy only required files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ownership fix
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Health check (PRO LEVEL)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -qO- http://localhost:3001 || exit 1

CMD ["node", "server.js"]