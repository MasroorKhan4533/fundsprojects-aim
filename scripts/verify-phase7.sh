#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="http://localhost:5001/api/v1"
WEB="http://localhost:5173"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT
FAIL=0

pass(){ echo "✅ $1"; }
fail(){ echo "❌ $1"; FAIL=1; }

echo "== Bundle 7 final localhost verification =="

curl -fsS "$API/health/ready" >/dev/null 2>&1 && pass "API ready" || fail "API not ready"
curl -fsS "$WEB" >/dev/null 2>&1 && pass "Frontend dev server live" || fail "Frontend dev server not ready"

if [ "$FAIL" -eq 0 ]; then
  LOGIN=$(curl -sS -c "$COOKIE_JAR" -H 'Content-Type: application/json' -d '{"identifier":"admin@fundsprojects.local","password":"Admin@12345","rememberMe":false}' "$API/auth/login")
  printf '%s' "$LOGIN" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"]' 2>/dev/null && pass "Admin authenticated" || fail "Admin authentication failed"
fi

if [ "$FAIL" -eq 0 ]; then
  PROFILE=$(curl -sS -b "$COOKIE_JAR" "$API/profile/me")
  printf '%s' "$PROFILE" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["profile"]["identity"]["userId"]' 2>/dev/null && pass "My Profile API verified" || fail "My Profile API failed"

  CAPS=$(curl -sS -b "$COOKIE_JAR" "$API/integrations/capabilities")
  printf '%s' "$CAPS" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["capabilities"]["calling"]["recordingReady"] is True' 2>/dev/null && pass "Integration adapter capabilities verified" || fail "Integration capabilities failed"

  CSV=$(mktemp /tmp/aim-phase7-import-XXXX.csv)
  printf 'Company,Full Name,Email,Mobile,Industry,City\nPhase 7 Runtime Preview,Runtime User,runtime.preview@example.com,+919999999969,Manufacturing,Pune\n' > "$CSV"
  PREVIEW=$(curl -sS -b "$COOKIE_JAR" -F "file=@$CSV;type=text/csv" "$API/imports/leads/preview")
  rm -f "$CSV"
  printf '%s' "$PREVIEW" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] and d["data"]["preview"]["summary"]["totalRows"] == 1' 2>/dev/null && pass "Lead import preview/validation verified" || fail "Lead import preview failed"
fi

for route in /app/aim-master /app/targets /app/a-master-leads /app/i-c1-c2 /app/m-c3-c4 /app/profile /app/admin/users; do
  curl -fsS "$WEB$route" >/dev/null 2>&1 || fail "SPA route unavailable: $route"
done
[ "$FAIL" -eq 0 ] && pass "Core SPA routes available"

if [ "$FAIL" -eq 0 ]; then
  "$ROOT/scripts/secret-scan.sh" >/dev/null 2>&1 && pass "Secret scan clean" || fail "Secret scan failed"
fi

if [ "$FAIL" -ne 0 ]; then echo "❌ Bundle 7 final localhost verification failed."; exit 1; fi
echo "✅ Bundle 7 final localhost verification passed."
