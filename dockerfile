# Use the official Node.js runtime as the base image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy the rest of the application code
COPY . .

# Build stage
FROM base AS build

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxt -u 1001

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod && pnpm cache clean

# Copy the built application from the build stage
COPY --from=build --chown=nuxt:nodejs /app/.output /app/.output

# Switch to the non-root user
USER nuxt

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV AUTH_ORIGIN=$AUTH_ORIGIN
ENV NUXT_AUTH_ORIGIN=$NUXT_AUTH_ORIGIN

# Start the application
CMD ["node", ".output/server/index.mjs"]
