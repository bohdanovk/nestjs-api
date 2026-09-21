# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24
ARG PNPM_VERSION=11.24.0

# ---------------------------------------------------------------------------
# Base: Node + pnpm
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
ENV CI=true \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    MONGOMS_DISABLE_POSTINSTALL=1
RUN npm install --global --no-fund --no-audit pnpm@${PNPM_VERSION}
WORKDIR /app

# ---------------------------------------------------------------------------
# Production dependencies only
# ---------------------------------------------------------------------------
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --ignore-scripts

# ---------------------------------------------------------------------------
# Build (all dependencies, type-check, SWC transpile)
# ---------------------------------------------------------------------------
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json nest-cli.json .swcrc ./
COPY src ./src
RUN pnpm build

# ---------------------------------------------------------------------------
# Runtime: minimal, non-root, health-checked
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
USER node
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:3000/health/live || exit 1
CMD ["node", "--enable-source-maps", "dist/main.js"]
