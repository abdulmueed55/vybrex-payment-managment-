#!/bin/sh
set -e
echo "=== Vybrex CRM Starting ==="

echo "Syncing database schema..."
cd /app/server
./node_modules/.bin/prisma db push --accept-data-loss 2>&1 || echo "Warning: DB push failed, starting anyway"

echo "Starting server..."
exec node /app/server/index.js
