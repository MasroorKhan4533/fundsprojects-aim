#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$HOME/Downloads/fundsprojects-aim}"
cd "$ROOT"
echo "== FundsProjects AIM · Phase 6 M C3/C4 bootstrap =="
echo "Running backend quality gate..."
(cd backend && npm run check && npm audit --omit=dev --audit-level=high)
echo "Running frontend quality gate..."
(cd frontend && npm run check)
echo "✅ Bundle 6 source + automated quality gates completed."
echo "Next: ./scripts/dev-local.sh"
echo "Then: ./scripts/verify-phase6.sh"
