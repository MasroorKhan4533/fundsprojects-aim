#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API_BASE_URL:-http://localhost:5001/api/v1}"
WEB="${WEB_BASE_URL:-http://localhost:5173}"
COOKIE_JAR="$(mktemp)"; trap 'rm -f "$COOKIE_JAR"' EXIT
printf '\n== Bundle 3 AIM Master + Targets verification ==\n'
curl -fsS "$API/health/ready" >/dev/null || { echo "❌ API not ready. Keep ./scripts/dev-local.sh running in Terminal 1."; exit 1; }
curl -fsS "$WEB/app/aim-master" >/dev/null; echo "✅ AIM Master SPA route live"
curl -fsS "$WEB/app/targets" >/dev/null; echo "✅ Target Sheet SPA route live"
LOGIN_PAYLOAD='{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}'
curl -fsS -c "$COOKIE_JAR" -H 'Content-Type: application/json' -d "$LOGIN_PAYLOAD" "$API/auth/login" >/dev/null; echo "✅ Admin authenticated"
USERS="$(curl -fsS -b "$COOKIE_JAR" "$API/users?page=1&limit=5&status=ACTIVE")"
ASSIGNEE="$(printf '%s' "$USERS" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["data"]; print(d["data"][0]["id"])')"
VERIFY_DATE="2099-12-31"
PAYLOAD="$(python3 - <<PY
import json
print(json.dumps({"targetDate":"$VERIFY_DATE","assignedTo":"$ASSIGNEE","focusStage":"C4","metrics":{"leads":1,"emails":2,"messages":3,"calls":4,"meetings":1,"c1":1,"c2":1,"c3":1,"c4":1,"proposals":1,"revenue":1000},"notes":"Bundle 3 runtime verifier"}))
PY
)"
CREATE="$(curl -fsS -b "$COOKIE_JAR" -H 'Content-Type: application/json' -d "$PAYLOAD" "$API/targets")" || { echo "❌ Target create failed. A verifier target may already exist for 2099-12-31/C4. Delete that single verifier record and rerun."; exit 1; }
TARGET_ID="$(printf '%s' "$CREATE" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"]; print(d["data"]["target"]["id"])')"; echo "✅ Target create API verified"
curl -fsS -b "$COOKIE_JAR" "$API/targets?page=1&limit=10&assignedTo=$ASSIGNEE" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["meta"]["total"]>=1'; echo "✅ Target list API verified"
curl -fsS -b "$COOKIE_JAR" "$API/dashboard/aim?assignedTo=$ASSIGNEE" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["dataReadiness"]["targets"] is True'; echo "✅ AIM dashboard aggregation API verified"
curl -fsS -b "$COOKIE_JAR" -X DELETE "$API/targets/$TARGET_ID" >/dev/null; echo "✅ Target delete API verified"
echo "✅ Bundle 3 AIM Master + Targets verification passed."
