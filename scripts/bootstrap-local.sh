#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

printf '\n== FundsProjects AIM · Bundle 0 bootstrap ==\n\n'

command -v node >/dev/null || { echo "Node.js is required."; exit 1; }
command -v npm >/dev/null || { echo "npm is required."; exit 1; }
command -v docker >/dev/null || { echo "Docker is required."; exit 1; }

docker info >/dev/null 2>&1 || { echo "Docker Desktop is installed but not running. Open Docker Desktop and run this command again."; exit 1; }

if [[ ! -f backend/.env ]]; then
  JWT_SECRET="$(openssl rand -hex 48)"
  cat > backend/.env <<ENV
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://aim_admin:aim_local_dev_change_me@127.0.0.1:27017/fundsprojects_aim?authSource=admin
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=2
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=8h
COOKIE_NAME=aim_token
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
REQUEST_BODY_LIMIT=1mb
SHUTDOWN_TIMEOUT_MS=10000
ENV
  echo "Created backend/.env with a generated local JWT secret."
else
  cp backend/.env "backend/.env.pre-bundle0.$(date +%Y%m%d%H%M%S)"
  JWT_SECRET="$(openssl rand -hex 48)"
  cat > backend/.env <<ENV
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://aim_admin:aim_local_dev_change_me@127.0.0.1:27017/fundsprojects_aim?authSource=admin
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=2
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=8h
COOKIE_NAME=aim_token
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
REQUEST_BODY_LIMIT=1mb
SHUTDOWN_TIMEOUT_MS=10000
ENV
  echo "Backed up the previous backend/.env and wrote the Production V1 local environment."
fi

if [[ ! -f frontend/.env ]]; then
  cp frontend/.env.example frontend/.env
fi

echo "Installing backend dependencies..."
npm --prefix backend install

echo "Installing frontend dependencies..."
npm --prefix frontend install

echo "Starting local MongoDB..."
docker compose up -d mongodb

echo "Waiting for MongoDB health..."
for _ in {1..40}; do
  STATUS="$(docker inspect --format='{{.State.Health.Status}}' fundsprojects-aim-mongodb 2>/dev/null || true)"
  [[ "$STATUS" == "healthy" ]] && break
  sleep 2
done

STATUS="$(docker inspect --format='{{.State.Health.Status}}' fundsprojects-aim-mongodb 2>/dev/null || true)"
[[ "$STATUS" == "healthy" ]] || { echo "MongoDB did not become healthy. Run: docker compose logs mongodb"; exit 1; }

echo "Running backend checks..."
npm --prefix backend run check

echo "Running frontend checks..."
npm --prefix frontend run check

printf '\n✅ Bundle 0 bootstrap completed successfully.\n'
printf 'Next command: ./scripts/dev-local.sh\n\n'
