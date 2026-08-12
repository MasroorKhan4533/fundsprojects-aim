#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "== FundsProjects AIM · Final localhost quality gate =="
(cd backend && npm run check && npm audit --omit=dev --audit-level=high)
(cd frontend && npm run check && npm audit --omit=dev --audit-level=high)
./scripts/secret-scan.sh
./scripts/verify-phase7.sh
echo "✅ LOCALHOST PRODUCTION V1 QUALITY GATE PASSED"
