FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production --no-audit --no-fund && npm cache clean --force

FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
ENV RUNTIME=true


ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ENV NEXT_PUBLIC_API_URL=""

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV RUNTIME=true

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 2323

ENV PORT=2323
ENV HOSTNAME="0.0.0.0"
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ENV NEXT_PUBLIC_API_URL=""

CMD ["node", "server.js"]