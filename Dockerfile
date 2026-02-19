FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (frozen lockfile for stability)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the project
RUN yarn build


FROM node:20-alpine AS runner

WORKDIR /app

# Install production runtime dependencies
RUN apk add --no-cache python3 make g++

# Copy built artifacts and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts
COPY --from=builder /app/.medusa/server/public ./.medusa/server/public

# Expose port (Cloud Run sets PORT env var automatically)
EXPOSE 9000

# Start command (handles migrations on startup)
CMD ["sh", "-c", "yarn medusa db:migrate && yarn start"]
