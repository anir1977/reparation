#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

if [[ -z "$DB_URL" ]]; then
  echo "❌ SUPABASE_DB_URL (ou DATABASE_URL) manquant dans .env.local"
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "❌ pg_dump introuvable. Installez postgresql-client."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
HOSTNAME_SAFE="$(hostname | tr -cd '[:alnum:]_-')"
OUT_FILE="$BACKUP_DIR/reparation_${HOSTNAME_SAFE}_${TIMESTAMP}.sql.gz"

echo "📦 Backup en cours..."
pg_dump "$DB_URL" --no-owner --no-privileges | gzip > "$OUT_FILE"

echo "✅ Backup créé: $OUT_FILE"

if [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
  find "$BACKUP_DIR" -type f -name "reparation_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
  echo "🧹 Nettoyage terminé (rétention: $RETENTION_DAYS jours)"
fi
