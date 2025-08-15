# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Production server
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built React app from builder stage
COPY --from=builder /app/build ./build

# Copy server file and other necessary files
COPY server.js ./
COPY src/types ./src/types
COPY src/i18n ./src/i18n

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]