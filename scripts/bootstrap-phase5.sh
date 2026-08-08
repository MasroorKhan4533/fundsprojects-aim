#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$HOME/Downloads/fundsprojects-aim}"
cd "$ROOT"
echo "== FundsProjects AIM · Phase 5 I C1/C2 bootstrap =="
echo "Running backend quality gate..."
(cd backend && npm run check && npm audit --omit=dev --audit-level=high)
echo "Running frontend quality gate..."
(cd frontend && npm run check)
echo "✅ Bundle 5 source + automated quality gates completed."
echo "Next: ./scripts/dev-local.sh"
echo "Then: ./scripts/verify-phase5.sh"
