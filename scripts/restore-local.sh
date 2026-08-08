#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then echo "Usage: ./scripts/restore-local.sh /absolute/path/to/backup.archive.gz"; exit 1; fi
if ! docker info >/dev/null 2>&1; then echo "❌ Docker Desktop is not running"; exit 1; fi
read -r -p "This will REPLACE the local fundsprojects_aim database. Type RESTORE to continue: " CONFIRM
if [ "$CONFIRM" != "RESTORE" ]; then echo "Restore cancelled"; exit 0; fi
cat "$FILE" | docker exec -i fundsprojects-aim-mongodb sh -lc 'mongorestore --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db fundsprojects_aim --archive --gzip --drop'
echo "✅ Local MongoDB restore completed"
