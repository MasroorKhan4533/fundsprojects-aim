#!/usr/bin/env bash
set -euo pipefail
API="http://localhost:5001/api/v1"
WEB="http://localhost:5173"
COOKIE="$(mktemp)"; trap 'rm -f "$COOKIE"' EXIT
printf '\n== Bundle 6 M C3/C4 verification ==\n'
curl -fsS "$API/health/ready" >/dev/null || { echo "❌ API not ready. Keep ./scripts/dev-local.sh running."; exit 1; }
curl -fsS "$WEB/app/m-c3-c4" >/dev/null || { echo "❌ M C3/C4 SPA route not ready."; exit 1; }
echo "✅ M C3/C4 SPA route live"
LOGIN="$(curl -fsS -c "$COOKIE" -H 'Content-Type: application/json' -d '{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}' "$API/auth/login")"
printf '%s' "$LOGIN" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"]' || { echo "❌ Admin login failed"; exit 1; }
echo "✅ Admin authenticated"
curl -fsS -b "$COOKIE" "$API/deals/workbench?page=1&limit=5" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and isinstance(d["data"],list)' || { echo "❌ Commercial workbench API failed"; exit 1; }
echo "✅ Commercial workbench API verified"
curl -fsS -b "$COOKIE" "$API/deals/summary" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and "summary" in d["data"] and "wonRevenue" in d["data"]["summary"]' || { echo "❌ Commercial summary API failed"; exit 1; }
echo "✅ Commercial summary API verified"
curl -fsS -b "$COOKIE" "$API/dashboard/aim" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["dataReadiness"]["c3c4"] is True and "weightedValue" in d["data"]["pipeline"]' || { echo "❌ AIM dashboard C3/C4 readiness failed"; exit 1; }
echo "✅ AIM dashboard C3/C4 + revenue wiring verified"
echo "✅ Bundle 6 M C3/C4 verification passed."
