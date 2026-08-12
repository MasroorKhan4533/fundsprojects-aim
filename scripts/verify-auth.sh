#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT
BASE="http://127.0.0.1:5001/api/v1"

echo "== Bundle 1 authentication verification =="
curl -fsS "$BASE/health/ready" >/dev/null || { echo "❌ API is not ready. Keep ./scripts/dev-local.sh running in Terminal 1."; exit 1; }
curl -fsS http://127.0.0.1:8025/ >/dev/null || { echo "❌ Mailpit is not ready."; exit 1; }

LOGIN="$(curl -fsS -c "$COOKIE_JAR" -H 'Content-Type: application/json' -d '{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}' "$BASE/auth/login")"
echo "$LOGIN" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["user"]["role"]=="ADMIN"' || { echo "❌ Admin login verification failed."; exit 1; }

curl -fsS -b "$COOKIE_JAR" "$BASE/auth/me" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["data"]["user"]["email"]=="admin@fundsprojects.local"' || { echo "❌ /auth/me verification failed."; exit 1; }

curl -fsS -b "$COOKIE_JAR" "$BASE/users?page=1&limit=5" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"]' || { echo "❌ Admin RBAC verification failed."; exit 1; }

echo "✅ Bundle 1 authentication verification passed."
echo "Manual business-flow test: http://localhost:5173/register → approve at /admin/users → open activation email in http://localhost:8025"
