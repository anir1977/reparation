#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/backups"
mkdir -p "$LOG_DIR"

CRON_SCHEDULE="${BACKUP_CRON_SCHEDULE:-0 2 * * *}"
CRON_CMD="cd $PROJECT_ROOT && bash scripts/backup-daily.sh >> $LOG_DIR/backup.log 2>&1"
CRON_LINE="$CRON_SCHEDULE $CRON_CMD"

CURRENT_CRON="$(crontab -l 2>/dev/null || true)"

if grep -Fq "$CRON_CMD" <<< "$CURRENT_CRON"; then
  echo "ℹ️ Tâche cron déjà installée."
  exit 0
fi

{ printf "%s\n" "$CURRENT_CRON"; printf "%s\n" "$CRON_LINE"; } | crontab -

echo "✅ Cron installé: $CRON_SCHEDULE"
echo "➡ Logs: $LOG_DIR/backup.log"
