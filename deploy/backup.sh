#!/usr/bin/env bash
# Cron-Job fuer taegliches Backup.
# Eintrag in /etc/cron.d/kapazito-backup:
#   0 3 * * * deploy /srv/kapazito/src/deploy/backup.sh >> /var/log/kapazito-backup.log 2>&1

set -euo pipefail

BACKUP_DIR=/srv/kapazito/storage/backups
TS=$(date +%Y-%m-%d_%H%M%S)

cd /srv/kapazito/src
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" \
  > "$BACKUP_DIR/kapazito_$TS.dump"

# Alte Dumps > 30 Tage loeschen
find "$BACKUP_DIR" -name "kapazito_*.dump" -mtime +30 -delete

echo "$(date -Is)  Backup kapazito_$TS.dump"
