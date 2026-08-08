#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API_BASE_URL:-http://localhost:5001/api/v1}"
WEB="${WEB_BASE_URL:-http://localhost:5173}"
COOKIE_JAR="$(mktemp)"
TARGET_ID=""

cleanup() {
  if [[ -n "${TARGET_ID:-}" && -f "$COOKIE_JAR" ]]; then
    curl -fsS -b "$COOKIE_JAR" -X DELETE "$API/targets/$TARGET_ID" >/dev/null 2>&1 || true
  fi
  rm -f "$COOKIE_JAR"
}
trap cleanup EXIT

printf '\n== Bundle 3 AIM Master + Targets verification ==\n'

curl -fsS "$API/health/ready" >/dev/null || {
  echo "❌ API not ready. Keep ./scripts/dev-local.sh running in Terminal 1."
  exit 1
}

curl -fsS "$WEB/app/aim-master" >/dev/null
echo "✅ AIM Master SPA route live"

curl -fsS "$WEB/app/targets" >/dev/null
echo "✅ Target Sheet SPA route live"

LOGIN_PAYLOAD='{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}'
curl -fsS -c "$COOKIE_JAR" -H 'Content-Type: application/json' -d "$LOGIN_PAYLOAD" "$API/auth/login" >/dev/null
echo "✅ Admin authenticated"

USERS="$(curl -fsS -b "$COOKIE_JAR" "$API/users?page=1&limit=5&status=ACTIVE")"
ASSIGNEE="$(printf '%s' "$USERS" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["data"]; print(d["data"][0]["id"])')"
VERIFY_DATE="2099-12-31"
VERIFY_NOTE="Bundle 3 runtime verifier"

# Make the verifier idempotent. A previous interrupted verification may have
# created its synthetic target but exited before the cleanup DELETE ran.
EXISTING="$(curl -fsS -b "$COOKIE_JAR" "$API/targets?page=1&limit=100&assignedTo=$ASSIGNEE&focusStage=C4&dateFrom=$VERIFY_DATE&dateTo=$VERIFY_DATE")"
STALE_IDS="$(printf '%s' "$EXISTING" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("\n".join(str(x["id"]) for x in d.get("data", []) if x.get("notes") == "Bundle 3 runtime verifier"))')"

if [[ -n "$STALE_IDS" ]]; then
  while IFS= read -r stale_id; do
    [[ -z "$stale_id" ]] && continue
    curl -fsS -b "$COOKIE_JAR" -X DELETE "$API/targets/$stale_id" >/dev/null
  done <<< "$STALE_IDS"
  echo "✅ Removed stale Bundle 3 verifier target"
fi

PAYLOAD="$(python3 - <<PY
import json
print(json.dumps({"targetDate":"$VERIFY_DATE","assignedTo":"$ASSIGNEE","focusStage":"C4","metrics":{"leads":1,"emails":2,"messages":3,"calls":4,"meetings":1,"c1":1,"c2":1,"c3":1,"c4":1,"proposals":1,"revenue":1000},"notes":"$VERIFY_NOTE"}))
PY
)"

CREATE="$(curl -fsS -b "$COOKIE_JAR" -H 'Content-Type: application/json' -d "$PAYLOAD" "$API/targets")" || {
  echo "❌ Target create failed."
  exit 1
}

TARGET_ID="$(printf '%s' "$CREATE" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"]; print(d["data"]["target"]["id"])')"
echo "✅ Target create API verified"

curl -fsS -b "$COOKIE_JAR" "$API/targets?page=1&limit=10&assignedTo=$ASSIGNEE" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["meta"]["total"]>=1'
echo "✅ Target list API verified"

curl -fsS -b "$COOKIE_JAR" "$API/dashboard/aim?assignedTo=$ASSIGNEE" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["dataReadiness"]["targets"] is True'
echo "✅ AIM dashboard aggregation API verified"

curl -fsS -b "$COOKIE_JAR" -X DELETE "$API/targets/$TARGET_ID" >/dev/null
TARGET_ID=""
echo "✅ Target delete API verified"

echo "✅ Bundle 3 AIM Master + Targets verification passed."
