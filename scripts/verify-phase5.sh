#!/usr/bin/env bash
set -euo pipefail
API="http://localhost:5001/api/v1"
WEB="http://localhost:5173"
COOKIE="$(mktemp)"; trap 'rm -f "$COOKIE"' EXIT
printf '\n== Bundle 5 I C1/C2 verification ==\n'
curl -fsS "$API/health/ready" >/dev/null || { echo "❌ API not ready. Keep ./scripts/dev-local.sh running."; exit 1; }
curl -fsS "$WEB/app/i-c1-c2" >/dev/null || { echo "❌ I C1/C2 SPA route not ready."; exit 1; }
echo "✅ I C1/C2 SPA route live"
LOGIN="$(curl -fsS -c "$COOKIE" -H 'Content-Type: application/json' -d '{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}' "$API/auth/login")"
printf '%s' "$LOGIN" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"]' || { echo "❌ Admin login failed"; exit 1; }
echo "✅ Admin authenticated"
curl -fsS -b "$COOKIE" "$API/interactions?page=1&limit=5" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and isinstance(d["data"],list)' || { echo "❌ Interaction list API failed"; exit 1; }
echo "✅ Interaction list API verified"
curl -fsS -b "$COOKIE" "$API/interactions/summary" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and "summary" in d["data"]' || { echo "❌ Interaction summary API failed"; exit 1; }
echo "✅ Interaction summary API verified"
curl -fsS -b "$COOKIE" "$API/dashboard/aim" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["dataReadiness"]["c1c2"] is True' || { echo "❌ AIM dashboard C1/C2 readiness failed"; exit 1; }
echo "✅ AIM dashboard C1/C2 actuals wired"
echo "✅ Bundle 5 I C1/C2 verification passed."
