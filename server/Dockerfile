# ---- Base ----
# Alpine = a minimal Linux distro. Smaller image, smaller attack
# surface, faster to pull. Pinning the major version (20, not
# "latest") means a build today and a build in six months use the
# same Node version — "latest" silently drifting is a classic way
# to get "works on my machine" bugs.
FROM node:20-alpine

WORKDIR /app

# ---- Install dependencies FIRST, before copying the rest of the code ----
# This is the single most important line in this file for build speed.
# Docker caches each instruction as a "layer". If this COPY only
# touches package*.json, then as long as those two files haven't
# changed, Docker reuses the cached `npm ci` layer on every rebuild —
# even if you've changed 50 source files since. Flip this order
# (copy everything, then npm ci) and you lose that cache on every
# single code change, because the "copy everything" layer changes
# constantly, invalidating every layer after it.
COPY package*.json ./

# npm ci (not npm install) — installs exactly what's in
# package-lock.json, nothing more, nothing resolved differently.
# Reproducible builds: the same lockfile always produces the same
# node_modules, in CI and in production alike.
# --omit=dev skips devDependencies (nodemon, eslint, etc.) — this is
# the production image, it doesn't need your dev tooling.
RUN npm ci --omit=dev

# Now copy the actual source.
COPY . .

# ---- Run as a non-root user ----
# By default a container runs as root. If an attacker finds a way to
# execute code inside this container, root means they can do anything
# root can do inside it. Dropping to an unprivileged user limits the
# blast radius — standard hardening step, and something interviewers
# specifically listen for.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

# Plain `node`, not `npm run start` — one fewer process in the
# container's process tree (npm spawning node as a child), and one
# fewer layer of indirection for signal handling (SIGTERM from
# `docker stop` reaches your app directly instead of npm first).
CMD ["node", "src/server.js"]
