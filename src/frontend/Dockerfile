FROM node:20-alpine AS builder
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm ci
COPY src/frontend/ .
# Set API URL to use relative path (proxied through Caddy)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM caddy:alpine

COPY --from=builder /app/dist /srv

EXPOSE 80