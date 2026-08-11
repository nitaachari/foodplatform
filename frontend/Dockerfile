# ======================================================
# Stage 1: build
# ======================================================
# React/Vite doesn't run in production — it compiles down to plain
# HTML/CSS/JS files. This stage exists purely to produce that static
# output; the Node runtime, Vite, and every npm package here are
# thrown away once the build finishes. None of it ships.
FROM node:20-alpine AS build

WORKDIR /app

# Same layer-caching reasoning as the backend: dependencies before
# source code.
COPY package*.json ./
RUN npm ci

COPY . .

# ---- Build-time vs. runtime env vars ----
# This trips people up: a normal `environment:` entry in
# docker-compose.yml only exists once the CONTAINER is running — but
# `npm run build` happens while the IMAGE is being built, before any
# container exists yet. So env vars for Vite have to be passed in as
# build ARGs instead, and explicitly promoted to ENV so the build
# step below can actually see them.
ARG VITE_API_URL=/api
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Vite reads VITE_* env vars at BUILD time, not runtime — they get
# baked directly into the compiled JS bundle as literal strings.
# That's different from the backend, where env vars are read fresh
# every time the process starts. Practical consequence: changing
# VITE_STRIPE_PUBLISHABLE_KEY means rebuilding the image, not just
# restarting the container.
RUN npm run build


# ======================================================
# Stage 2: serve
# ======================================================
# This is "multi-stage build" — the actual point of interview
# interest here. FROM appears twice: everything above is the "build"
# stage, everything below is a fresh, separate, much smaller image.
# Only the ONE thing we COPY --from=build actually crosses over.
# The end result ships nginx + static files — no Node, no npm, no
# source code, no node_modules. A few MB instead of several hundred.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
