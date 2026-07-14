# ═══════════════════════════════════════════════════════════════════════════════
# Dockerfile — Pierush Backend
#
# This uses a MULTI-STAGE BUILD.
#
# WHY TWO STAGES?
#   Building TypeScript requires devDependencies like tsup, tsx, and typescript.
#   Running the compiled JavaScript requires ONLY production dependencies.
#   If we used a single stage, we'd ship ~200MB of build tools into production.
#   Two stages let us compile in Stage 1 and run in Stage 2 with only what's
#   necessary. The final image is much smaller (~80–100MB vs ~300MB+).
# ═══════════════════════════════════════════════════════════════════════════════


# ───────────────────────────────────────────────────────────────────────────────
# STAGE 1 — builder
#
# Purpose: Install ALL dependencies (dev + prod) and compile TypeScript to JS.
# This stage produces dist/ — the compiled output.
# Nothing from this stage except dist/ is carried into Stage 2.
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# WHY node:20-alpine?
#   - node:20 = Active LTS (Long-Term Support) release. Stable and supported.
#   - alpine = Based on Alpine Linux (3MB) instead of Debian/Ubuntu (150MB+).
#   - alpine has no unnecessary OS utilities, making images leaner and safer.
#   - Your project has no native C++ addons, so alpine is perfectly compatible.

# Set the working directory inside the container.
# All COPY, RUN, CMD instructions below are relative to /app.
# WHY /app? It's the conventional Node.js container working directory.
WORKDIR /app

# ── Layer Caching Trick ────────────────────────────────────────────────────────
# Copy ONLY the package manifest files FIRST — before copying source code.
#
# WHY? Docker builds images layer by layer. If a layer hasn't changed, Docker
# reuses the cached version instead of re-running the command. By copying
# package.json + package-lock.json before src/, Docker can reuse the
# `npm ci` layer on every build where only source code changed (the common case).
# This turns a 60-second install into a 1-second cache hit for most builds.
COPY package.json package-lock.json ./

# Install ALL dependencies — including devDependencies.
# We need tsup, typescript, tsx, and drizzle-kit to compile the project.
#
# WHY npm ci instead of npm install?
#   - `npm ci` reads package-lock.json exactly, giving deterministic installs.
#   - `npm install` resolves versions and may update package-lock.json.
#   - `npm ci` is faster in automated environments (CI, Docker).
#   - `npm ci` errors if package-lock.json is out of sync — surfacing real bugs.
RUN npm ci

# Now copy the TypeScript source and configuration files.
#
# WHY copy tsconfig.json?
#   tsup reads tsconfig.json to understand TypeScript options AND to resolve
#   path aliases. Your project uses @/ as an alias for src/.
#   Without tsconfig.json, tsup can't resolve `@/utils/logger.ts` etc.
#
# WHY copy src/ after package.json?
#   Source code changes much more frequently than dependencies.
#   By copying packages first, we protect the npm ci layer from being
#   invalidated by every code change.
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript.
#
# This runs: tsup src/index.ts --format esm --clean
# (as defined in package.json's "build" script)
#
# WHAT tsup does:
#   1. Reads tsconfig.json for TypeScript and path alias config
#   2. Starting from src/index.ts, traces all imports recursively
#   3. Resolves @/ aliases (e.g. @/utils/logger.ts → src/utils/logger.ts)
#   4. Compiles TypeScript → JavaScript using esbuild (fast)
#   5. Bundles everything into dist/index.js as a single ESM file
#   6. --clean deletes any previous dist/ before writing
#
# WHY does tsup work even though tsconfig.json has "noEmit": true?
#   tsup uses esbuild internally — NOT tsc. The "noEmit" flag is a tsc-only
#   setting. tsup completely ignores it and always produces output.
#   This is correct and intentional in your project's setup.
RUN npm run build


# ───────────────────────────────────────────────────────────────────────────────
# STAGE 2 — production
#
# Purpose: Minimal runtime image. Contains only what's needed to RUN the app.
# We start fresh from a clean base image so nothing leaks from Stage 1.
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install dumb-init — a minimal process supervisor.
#
# WHY dumb-init?
#   In Docker, every container must have a PID 1 process. Normally that's your
#   application (Node.js). But Node.js is NOT designed to run as PID 1:
#
#   Problem 1 — Signal forwarding:
#     When you run `docker stop`, Docker sends SIGTERM to PID 1.
#     If Node.js is PID 1 and doesn't handle SIGTERM, Docker waits 10 seconds
#     then force-kills it (SIGKILL). This prevents graceful shutdown.
#
#   Problem 2 — Zombie processes:
#     PID 1 is responsible for "reaping" zombie child processes.
#     Node.js doesn't do this, which can cause resource leaks.
#
#   dumb-init solves both:
#     - It runs as PID 1 and properly forwards signals to Node.js
#     - It reaps zombie child processes
#     - `docker stop` → clean, fast graceful shutdown
#
#   --no-cache: don't save the Alpine package cache in this layer (keeps image smaller)
RUN apk add --no-cache dumb-init

WORKDIR /app

# Set NODE_ENV to production before installing dependencies.
#
# WHY before npm ci?
#   - Some packages behave differently based on NODE_ENV (e.g., Express disables
#     detailed error messages in production for security)
#   - Our modified logger.ts uses this to disable file transports and
#     log only to stdout/stderr (Docker-native logging)
#   - Setting it as ENV means it's baked into the image, not just a runtime var
ENV NODE_ENV=production

# Copy package manifests for production dependency install.
# (Same layer caching strategy as Stage 1)
COPY package.json package-lock.json ./

# Install ONLY production dependencies — exclude all devDependencies.
#
# WHY --omit=dev?
#   devDependencies (tsup, typescript, tsx, drizzle-kit) are NOT needed at runtime.
#   tsup already compiled everything into dist/index.js — a single bundled file.
#   Your app at runtime only needs: express, mysql2, drizzle-orm, bcryptjs,
#   jsonwebtoken, cors, cookie-parser, winston, chalk, dotenv, razorpay, @google/genai
#
#   Excluding devDependencies removes ~150MB of packages from the final image.
RUN npm ci --omit=dev

# Copy ONLY the compiled dist/ from Stage 1 (the builder).
#
# WHY --from=builder?
#   This pulls files from Stage 1 into the current Stage 2.
#   We ONLY copy dist/ — not src/, not tsconfig.json, not node_modules from builder.
#   Stage 2's node_modules only has production packages (installed above).
#
# dist/index.js is the complete, self-contained compiled application.
# All @/ path aliases are already resolved inside it.
COPY --from=builder /app/dist ./dist

# Switch to the non-root 'node' user.
#
# WHY non-root?
#   Docker containers run as root (uid 0) by default.
#   If the container is ever compromised (e.g., RCE vulnerability),
#   a root process inside the container has more potential for damage.
#   The 'node' user (uid 1000) is pre-created in node:alpine images.
#   Running as 'node' limits the blast radius of any security incident.
#
#   IMPORTANT: This line must come AFTER npm ci and COPY, because those
#   operations need to write files that the 'node' user may not own.
USER node

# Document that the container listens on port 5000.
#
# WHY EXPOSE?
#   EXPOSE does NOT actually publish the port to the host.
#   It's metadata — documentation for developers and Docker tooling.
#   The actual port mapping is done in docker-compose.yml.
#   The app binds to whatever PORT env var says (default: 5000).
EXPOSE 5000

# Docker health check.
#
# Docker sends this command every 30 seconds to check if the container is alive.
# The container gets a status: starting → healthy or unhealthy.
# You can see this with `docker ps` or `docker inspect pierush-backend`.
#
# --interval=30s   : run the check every 30 seconds
# --timeout=5s     : if the check takes longer than 5s, count as failed
# --start-period=15s : wait 15s after container starts before checking
#                     (gives Node.js time to initialize and connect to MySQL)
# --retries=3      : mark as UNHEALTHY after 3 consecutive failures
#
# WHY wget instead of curl?
#   Alpine Linux ships with wget by default. curl is not installed.
#   wget -qO- : quiet mode, output to stdout (so we can check the response)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/health || exit 1

# Set dumb-init as the ENTRYPOINT (PID 1 process supervisor).
#
# WHY ENTRYPOINT vs CMD?
#   ENTRYPOINT: always runs — it's the executable (dumb-init here)
#   CMD: arguments passed to ENTRYPOINT — these can be overridden at runtime
#
#   dumb-init -- node dist/index.js
#   └── dumb-init is PID 1, it launches node as a child process
#       and forwards all signals to it properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application.
# node dist/index.js runs the compiled ESM bundle.
# dumb-init (from ENTRYPOINT) wraps this as its child process.
CMD ["node", "dist/index.js"]
