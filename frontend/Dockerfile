# syntax=docker/dockerfile:1

# ---------- Build ----------
FROM node:24-alpine AS build
WORKDIR /app

# package*.json copied alone, same reasoning as the backend's dependency-first layer: installing
# node_modules is the slow step, and it should only re-run when a dependency actually changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime ----------
# nginx serves the compiled static bundle and reverse-proxies /api to the backend container — see
# nginx.conf and ADR-6 for why that removes the need for CORS in this deployment entirely.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/fretlab-frontend/browser /usr/share/nginx/html

EXPOSE 80
