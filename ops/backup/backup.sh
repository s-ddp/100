#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%F_%H-%M-%S)"
DIR="/backups"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$DIR"

echo "[backup] postgres dump..."
pg_dump "$DATABASE_URL" | gzip > "$DIR/postgres_${TS}.sql.gz"

echo "[backup] redis dump..."
redis-cli -u "$REDIS_URL" --rdb "$DIR/redis_${TS}.rdb"

echo "[backup] cleanup older than ${KEEP_DAYS} days..."
find "$DIR" -type f -mtime "+${KEEP_DAYS}" -delete

echo "[backup] done: $TS"
