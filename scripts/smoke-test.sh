#!/bin/bash

set -e

BASE_URL="http://localhost:5001/api/v1"
COOKIE_FILE="/tmp/fundsprojects-aim-cookies.txt"

EMAIL="admin@fundsprojects.local"
PASSWORD="Admin@12345"

echo "======================================"
echo "FundsProjects AIM — Smoke Test"
echo "======================================"

echo "1. HEALTH"
curl -fsS "$BASE_URL/health"
echo

echo "2. LOGIN"
rm -f "$COOKIE_FILE"

curl -fsS \
-c "$COOKIE_FILE" \
-X POST "$BASE_URL/auth/login" \
-H "Content-Type: application/json" \
-d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

echo

echo "3. USERS"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/users" > /tmp/aim-users.json
echo "PASS"

echo "4. LEADS"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/leads?limit=10" > /tmp/aim-leads.json
echo "PASS"

echo "5. C1"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/c1" > /tmp/aim-c1.json
echo "PASS"

echo "6. C2"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/c2" > /tmp/aim-c2.json
echo "PASS"

echo "7. C3"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/c3" > /tmp/aim-c3.json
echo "PASS"

echo "8. C4"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/c4" > /tmp/aim-c4.json
echo "PASS"

echo "9. DASHBOARD"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/dashboard" > /tmp/aim-dashboard.json
echo "PASS"

echo "10. TARGETS"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/targets" > /tmp/aim-targets.json
echo "PASS"

echo "11. PERFORMANCE"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/performance" > /tmp/aim-performance.json
echo "PASS"

echo "12. HANDOVERS"
curl -fsS -b "$COOKIE_FILE" "$BASE_URL/handovers" > /tmp/aim-handovers.json
echo "PASS"

rm -f "$COOKIE_FILE"

echo "======================================"
echo "ALL BACKEND SMOKE TESTS PASSED"
echo "======================================"
