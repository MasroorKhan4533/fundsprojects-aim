#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== FundsProjects AIM · Bundle 1 Authentication bootstrap =="
command -v docker >/dev/null || { echo "Docker is required."; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker Desktop is not running."; exit 1; }
[[ -f backend/.env ]] || { echo "backend/.env is missing. Apply Bundle 0 first."; exit 1; }

ensure_env() {
  local key="$1" value="$2"
  grep -q "^${key}=" backend/.env || printf '\n%s=%s\n' "$key" "$value" >> backend/.env
}

ensure_env ACCESS_TOKEN_TTL_MINUTES 15
ensure_env REFRESH_TOKEN_TTL_DAYS 7
ensure_env REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS 30
ensure_env ACCESS_COOKIE_NAME aim_access_token
ensure_env REFRESH_COOKIE_NAME aim_refresh_token
ensure_env ACTIVATION_TOKEN_TTL_MINUTES 1440
ensure_env PASSWORD_RESET_TOKEN_TTL_MINUTES 30
ensure_env BCRYPT_ROUNDS 12
ensure_env LOGIN_MAX_FAILURES 5
ensure_env LOGIN_LOCK_MINUTES 15
ensure_env SMTP_HOST 127.0.0.1
ensure_env SMTP_PORT 1025
ensure_env SMTP_SECURE false
ensure_env SMTP_USER ""
ensure_env SMTP_PASSWORD ""
ensure_env EMAIL_FROM 'FundsProjects AIM <no-reply@fundsprojects.local>'
ensure_env EMAIL_DELIVERY_MODE smtp
ensure_env BOOTSTRAP_ADMIN_FULL_NAME 'FundsProjects Admin'
ensure_env BOOTSTRAP_ADMIN_EMAIL admin@fundsprojects.local
ensure_env BOOTSTRAP_ADMIN_MOBILE +919999999999
ensure_env BOOTSTRAP_ADMIN_DESIGNATION Administrator
ensure_env BOOTSTRAP_ADMIN_PASSWORD 'Admin@12345'

echo "Installing Bundle 1 backend dependencies..."
npm --prefix backend install

echo "Installing Bundle 1 frontend dependencies..."
npm --prefix frontend install

echo "Starting MongoDB + local Mailpit email service..."
docker compose up -d mongodb mailpit

for _ in {1..40}; do
  STATUS="$(docker inspect --format='{{.State.Health.Status}}' fundsprojects-aim-mongodb 2>/dev/null || true)"
  [[ "$STATUS" == "healthy" ]] && break
  sleep 2
done
[[ "$(docker inspect --format='{{.State.Health.Status}}' fundsprojects-aim-mongodb 2>/dev/null || true)" == "healthy" ]] || { echo "MongoDB did not become healthy."; exit 1; }

for _ in {1..30}; do
  curl -fsS http://127.0.0.1:8025/ >/dev/null 2>&1 && break
  sleep 1
done
curl -fsS http://127.0.0.1:8025/ >/dev/null || { echo "Mailpit did not become ready. Run: docker compose logs mailpit"; exit 1; }

echo "Creating/verifying local bootstrap administrator..."
npm --prefix backend run seed:admin

echo "Running complete backend quality gate..."
npm --prefix backend run check

echo "Running complete frontend quality gate..."
npm --prefix frontend run check

echo "✅ Bundle 1 bootstrap completed successfully."
echo "Start the app with: ./scripts/dev-local.sh"
echo "Mailpit inbox: http://localhost:8025"
