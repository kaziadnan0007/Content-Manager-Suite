#!/bin/bash
# Start both API server and shop frontend concurrently

export PORT=8080
export NODE_ENV=development

# Start API server in background
pnpm --filter @workspace/api-server run dev &
API_PID=$!

# Start shop frontend
export PORT=24349
export BASE_PATH=/
pnpm --filter @workspace/shop run dev &
SHOP_PID=$!

# Wait for both
wait $API_PID $SHOP_PID
