# Use lightweight Node image
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy rest of project
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build NestJS app
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
