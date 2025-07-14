FROM node:20.9.0-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf ~/.npm

FROM node:20.9.0-alpine AS prod
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S expressjs -u 1001

COPY --from=deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=expressjs:nodejs /app/package*.json ./

COPY --chown=expressjs:nodejs src ./src
COPY --chown=expressjs:nodejs .env ./

USER expressjs

EXPOSE 8888

CMD ["node", "src/server.js"]