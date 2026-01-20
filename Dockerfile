# ========================================
# Stage 1: Build - Compile TypeScript
# ========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# ========================================
# Stage 2: Production - Run compiled code
# ========================================
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder
COPY --from=builder /usr/src/app/dist ./dist

# Copy necessary runtime files
COPY app/uploads ./app/uploads
COPY .sequelizerc ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]

# ========================================
# Stage 3: Development - Hot reload with TypeScript
# ========================================
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start with nodemon and tsx for hot reload
CMD ["npx", "nodemon", "--exec", "tsx", "server.ts"]
