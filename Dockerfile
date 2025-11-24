## Dockerfile for AnalyzeTech docs_architecture (React/Vite app)
# ------------------------------------------------------------
# Multi-stage build using Node.js for building the app and Nginx for serving
# ------------------------------------------------------------

# ---------- Builder Stage ----------
FROM node:20-alpine AS builder

# Install pnpm (fast package manager)
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only package files first for caching dependencies
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies (including dev for build)
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the Vite app (produces a static site in /app/dist)
RUN pnpm run build

# ---------- Production Stage ----------
FROM nginx:stable-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default HTTP port
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
