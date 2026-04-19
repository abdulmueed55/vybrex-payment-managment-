FROM node:18-alpine
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Install server dependencies
COPY server/package.json ./server/
RUN cd server && npm install

# Install client dependencies (force dev deps for build tools)
COPY client/package.json ./client/
RUN cd client && npm install --include=dev

# Copy all source files
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build React frontend
RUN cd client && npm run build

# Verify build output exists
RUN ls -la client/dist/

EXPOSE 3000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
