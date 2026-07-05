# syntax=docker/dockerfile:1
#
# SlowGuardian V10 — canonical container image.
#
#   Build from the REPO ROOT (the web build needs the repo-root icon set):
#     docker build -f v10/Dockerfile -t slowguardian:10 .
#   Run:
#     docker run --rm -p 8080:8080 slowguardian:10
#
# Multi-stage: (1) build the static Astro frontend, (2) resolve production-only
# server deps (drops puppeteer-core), (3) a slim runtime that runs the Express
# proxy server serving web/dist + the Scramjet/bare-mux/epoxy bundles.

# ---- 1. Build the static frontend -------------------------------------------
FROM node:20-slim AS web
WORKDIR /web
COPY v10/web/package.json v10/web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY v10/web/ ./
# Catalog icons live in the repo-root static/ tree (kept out of web/ to avoid an
# 18MB git duplicate). Place them where astro build expects; sync-icons then
# no-ops on the now-absent source.
COPY static/assets/media/icons/ ./public/assets/media/icons/
RUN npm run build

# ---- 2. Production server dependencies --------------------------------------
FROM node:20-slim AS deps
WORKDIR /app
COPY v10/package.json v10/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- 3. Runtime -------------------------------------------------------------
FROM node:20-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0
WORKDIR /app

COPY v10/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY v10/src ./src
COPY v10/public ./public
COPY --from=web /web/dist ./web/dist

EXPOSE 8080

# Readiness gate: the proxy bundles + built frontend must actually resolve.
HEALTHCHECK --interval=30s --timeout=4s --start-period=8s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

USER node
CMD ["node", "src/server.js"]
