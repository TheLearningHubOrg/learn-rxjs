# Multi-stage Dockerfile for modern RxJS 7+ TypeScript application
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json vitest.config.ts ./
RUN npm install
COPY src/ ./src/
COPY tests/ ./tests/
RUN npm test && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]