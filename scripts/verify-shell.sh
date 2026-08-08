#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API_BASE_URL:-http://localhost:5001/api/v1}"
WEB="${WEB_BASE_URL:-http://localhost:5173}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT
printf '\n== Bundle 2 application shell verification ==\n'
if ! docker ps --filter "name=fundsprojects-aim-mongodb" --filter "health=healthy" --format '{{.Names}}' | grep -qx 'fundsprojects-aim-mongodb'; then echo "❌ MongoDB container is not healthy."; exit 1; fi
echo "✅ MongoDB healthy"
curl -fsS "$API/health/live" >/dev/null
echo "✅ API live"
curl -fsS "$WEB/" >/dev/null
echo "✅ Frontend dev server live"
LOGIN_PAYLOAD='{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}'
curl -fsS -c "$COOKIE_JAR" -H 'Content-Type: application/json' -d "$LOGIN_PAYLOAD" "$API/auth/login" >/dev/null
curl -fsS -b "$COOKIE_JAR" "$API/auth/me" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["user"]["role"]=="ADMIN"'
echo "✅ Protected admin session verified"
for route in aim-master targets a-master-leads i-c1-c2 m-c3-c4 profile admin/users; do curl -fsS "$WEB/app/$route" >/dev/null; echo "✅ SPA route /app/$route available"; done
echo "✅ Bundle 2 application shell verification passed."
