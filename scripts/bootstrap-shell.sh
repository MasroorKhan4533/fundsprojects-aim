#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
printf '\n== FundsProjects AIM · Bundle 2 App Shell bootstrap ==\n'
echo "Running frontend lint + tests + production build..."
npm --prefix "$ROOT/frontend" run check
echo ""
echo "Running backend regression gate..."
npm --prefix "$ROOT/backend" run check
echo ""
echo "Checking production dependency security..."
npm --prefix "$ROOT/frontend" audit --omit=dev --audit-level=high
npm --prefix "$ROOT/backend" audit --omit=dev --audit-level=high
echo ""
git -C "$ROOT" diff --check
echo "✅ Bundle 2 automated quality gates passed."
