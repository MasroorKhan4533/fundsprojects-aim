#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:5001/api/v1}"

echo "== Bundle 0 local verification =="
echo "MongoDB container:"
docker inspect --format='{{.State.Status}} / {{.State.Health.Status}}' fundsprojects-aim-mongodb

echo ""
echo "API liveness:"
curl --fail --silent --show-error "$API_URL/health/live" | python3 -m json.tool

echo ""
echo "API readiness:"
curl --fail --silent --show-error "$API_URL/health/ready" | python3 -m json.tool

echo ""
echo "✅ Bundle 0 local verification passed."
