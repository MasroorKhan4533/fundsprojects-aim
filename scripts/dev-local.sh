#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

docker compose up -d mongodb

cleanup() {
  echo "Stopping local application processes..."
  kill "${BACK_PID:-}" "${FRONT_PID:-}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

npm --prefix backend run dev &
BACK_PID=$!

npm --prefix frontend run dev -- --host 127.0.0.1 &
FRONT_PID=$!

echo ""
echo "FundsProjects AIM local stack"
echo "Frontend: http://localhost:5173"
echo "API live: http://localhost:5001/api/v1/health/live"
echo "API ready: http://localhost:5001/api/v1/health/ready"
echo "Press Ctrl+C to stop frontend/backend. MongoDB remains running."
echo ""

wait "$BACK_PID" "$FRONT_PID"
