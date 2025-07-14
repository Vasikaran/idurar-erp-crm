FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM node:22-alpine AS prod

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf ~/.npm

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
# COPY --from=builder --chown=nestjs:nodejs /app/.env ./

USER nestjs

EXPOSE 2222

CMD ["node", "dist/main"]