FROM oven/bun:slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies using bun
RUN bun install

# Generate Prisma Client
RUN bun x prisma generate

# Copy source code
COPY . .

# Build TypeScript (optional since bun can run ts directly)
RUN bun run build

# Expose port
EXPOSE 3000

# Start script that runs migrations and starts the app
CMD ["sh", "-c", "bun x prisma migrate deploy && bun run seed || true && bun run start"]
