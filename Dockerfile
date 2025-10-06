# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Install Chrome dependencies for whatsapp-web.js
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chrome executable path for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Extra envs to stabilize Puppeteer
ENV NODE_OPTIONS=--max_old_space_size=512

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for build
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
ARG VITE_API_KEY
ARG VITE_API_BASE_URL
RUN VITE_API_KEY=$VITE_API_KEY \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    npm run build

# Prune devDependencies for a slimmer production image
RUN npm prune --production && npm cache clean --force

# Create directory for WhatsApp sessions
RUN mkdir -p /usr/src/app/.wwebjs_auth

# Expose port
EXPOSE 4300

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Start the application
CMD ["npm", "start"]
