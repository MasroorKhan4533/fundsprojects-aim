#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
docker compose up -d mongodb mailpit
cleanup() { echo "Stopping local application processes..."; kill "${BACK_PID:-}" "${FRONT_PID:-}" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
npm --prefix backend run dev & BACK_PID=$!
npm --prefix frontend run dev -- --host 127.0.0.1 & FRONT_PID=$!
echo ""
echo "FundsProjects AIM local stack"
echo "Frontend:     http://localhost:5173"
echo "API:          http://localhost:5001/api/v1"
echo "Mailpit:      http://localhost:8025"
echo "Admin login:  admin@fundsprojects.local / Admin@12345"
echo "Press Ctrl+C to stop frontend/backend. MongoDB and Mailpit remain running."
echo ""
wait "$BACK_PID" "$FRONT_PID"
