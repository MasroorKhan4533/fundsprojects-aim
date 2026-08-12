#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API_BASE_URL:-http://localhost:5001/api/v1}"
WEB="${WEB_BASE_URL:-http://localhost:5173}"
COOKIE_JAR="$(mktemp)"; trap 'rm -f "$COOKIE_JAR"' EXIT
printf '\n== Bundle 4 A Master Leads verification ==\n'
curl -fsS "$API/health/ready" >/dev/null || { echo "❌ API not ready. Keep ./scripts/dev-local.sh running in Terminal 1."; exit 1; }
echo "✅ API ready"
curl -fsS "$WEB/app/a-master-leads" >/dev/null; echo "✅ A Master Leads SPA route live"
LOGIN_PAYLOAD='{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}'
curl -fsS -c "$COOKIE_JAR" -H 'Content-Type: application/json' -d "$LOGIN_PAYLOAD" "$API/auth/login" >/dev/null; echo "✅ Admin authenticated"
curl -fsS -b "$COOKIE_JAR" "$API/leads?page=1&limit=25&sortBy=updatedAt&sortOrder=desc" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and "meta" in d and isinstance(d["data"], list)'; echo "✅ Server-side lead list API verified"
curl -fsS -b "$COOKIE_JAR" "$API/leads/summary" | python3 -c 'import json,sys; d=json.load(sys.stdin); s=d["data"]["summary"]; assert d["success"] and "total" in s and "estimatedBudget" in s'; echo "✅ Lead summary API verified"
curl -fsS -b "$COOKIE_JAR" "$API/dashboard/aim" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["dataReadiness"]["leads"] is True and "leads" in d["data"]["actuals"]'; echo "✅ AIM dashboard lead aggregation verified"
echo "✅ Bundle 4 A Master Leads verification passed."
