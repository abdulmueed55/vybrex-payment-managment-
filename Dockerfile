FROM node:18-alpine
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy and install server dependencies
COPY server/package.json ./server/
RUN cd server && npm install

# Copy and build client
COPY client/package.json ./client/
RUN cd client && npm install

COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build frontend
RUN cd client && npm run build

EXPOSE 3000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
