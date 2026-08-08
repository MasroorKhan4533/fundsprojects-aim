#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FAIL=0

echo "== Secret / sensitive-file scan =="

mapfile_compat() { while IFS= read -r line; do printf '%s\n' "$line"; done; }

SENSITIVE_FILES=$(find backend frontend -maxdepth 2 -type f \( -name '.env.*' -o -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' \) \
  ! -name '.env.example' ! -name '.env.docker.example' 2>/dev/null || true)
if [ -n "$SENSITIVE_FILES" ]; then
  echo "❌ Sensitive backup/key files found:"
  echo "$SENSITIVE_FILES"
  FAIL=1
else
  echo "✅ No forbidden environment backup/key files"
fi

if grep -RIlE --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.bundle-backups --exclude='*.lock' \
  'AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----' . >/tmp/aim-secret-hits 2>/dev/null; then
  echo "❌ High-confidence secret pattern found in these files (contents hidden):"
  cat /tmp/aim-secret-hits
  FAIL=1
else
  echo "✅ No high-confidence credential patterns"
fi
rm -f /tmp/aim-secret-hits

if [ "$FAIL" -ne 0 ]; then
  echo "❌ Secret scan failed"
  return 1 2>/dev/null || exit 1
fi

echo "✅ Secret scan passed"
