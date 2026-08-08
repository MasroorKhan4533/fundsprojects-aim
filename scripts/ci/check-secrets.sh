#!/usr/bin/env bash
set -euo pipefail

echo "== Secret / sensitive-file scan =="

BAD_FILES="$(
  git ls-files |
  grep -E '(^|/)\.env($|\.)|\.pem$|\.p12$|\.pfx$|id_rsa$|id_ed25519$|credentials($|\.)' |
  grep -vE '(^|/)\.env(\.[^/]+)*\.(example|sample|template)$' || true
)"

if [[ -n "$BAD_FILES" ]]; then
  echo "❌ Forbidden tracked secret-like files:"
  printf '%s\n' "$BAD_FILES"
  exit 1
fi

if git grep -nE \
  'AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----' \
  -- ':!package-lock.json' ':!frontend/package-lock.json' ':!backend/package-lock.json' \
  >/tmp/fpa-secret-hits.txt 2>/dev/null; then
  echo "❌ High-confidence credential pattern found:"
  cat /tmp/fpa-secret-hits.txt
  rm -f /tmp/fpa-secret-hits.txt
  exit 1
fi

rm -f /tmp/fpa-secret-hits.txt
echo "✅ Secret scan passed"
