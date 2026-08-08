#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "== FundsProjects AIM · Bundle 3 bootstrap =="
cd "$ROOT/backend"
npm install
npm run check
npm audit --omit=dev --audit-level=high
cd "$ROOT/frontend"
npm install
npm run check
printf '\n✅ Bundle 3 automated quality gates passed.\n'
