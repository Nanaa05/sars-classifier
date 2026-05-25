FROM node:20-alpine AS builder
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm ci
COPY src/frontend/ .
RUN npm run build

FROM caddy:alpine

COPY --from=builder /app/dist /srv

EXPOSE 80