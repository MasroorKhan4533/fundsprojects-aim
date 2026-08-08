#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$ROOT/backups"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/fundsprojects_aim-$STAMP.archive.gz"

if ! docker info >/dev/null 2>&1; then echo "❌ Docker Desktop is not running"; exit 1; fi
if ! docker ps --format '{{.Names}}' | grep -qx 'fundsprojects-aim-mongodb'; then echo "❌ fundsprojects-aim-mongodb is not running"; exit 1; fi

echo "Creating MongoDB backup..."
docker exec fundsprojects-aim-mongodb sh -lc 'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db fundsprojects_aim --archive --gzip' > "$OUT"
chmod 600 "$OUT"
echo "✅ Backup created: $OUT"
