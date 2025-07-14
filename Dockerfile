FROM node:20.9.0-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM node:20.9.0-alpine AS backend-deps

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf ~/.npm

FROM node:20.9.0-alpine AS prod
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S expressjs -u 1001

COPY --from=backend-deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=backend-deps --chown=expressjs:nodejs /app/package*.json ./
COPY --chown=expressjs:nodejs backend/src ./src
COPY --chown=expressjs:nodejs backend/.env ./

COPY --chown=expressjs:nodejs backend/public ./public

COPY --from=frontend-builder --chown=expressjs:nodejs /app/frontend/dist ./public/app

USER expressjs

EXPOSE 8888

CMD ["node", "src/server.js"]