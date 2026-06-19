#!/bin/bash
set -e

cd "$(dirname "$0")/.."

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Error: No backup file provided."
  echo "Usage: ./scripts/restore-db.sh backups/backup_2026-06-19_10-30-00.dump.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found."
  exit 1
fi

# Set defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-vikas_inventory}

echo "=========================================="
echo "          CRITICAL SAFETY CHECK           "
echo "=========================================="
echo "Target Host:     ${DB_HOST}:${DB_PORT}"
echo "Target User:     ${DB_USER}"
echo "Target Database: ${DB_NAME}"
echo "Backup File:     ${BACKUP_FILE}"
echo "=========================================="
echo "WARNING: YOU ARE ABOUT TO OVERWRITE DATABASE DATA"
echo ""
read -p "Type RESTORE to continue: " CONFIRMATION

if [ "$CONFIRMATION" != "RESTORE" ]; then
  echo "Aborted. Target database was NOT modified."
  exit 0
fi

echo "Starting restore process..."

export PGPASSWORD=${DB_PASS}

if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing and restoring..."
  gunzip -c "$BACKUP_FILE" | pg_restore -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean
else
  echo "Restoring uncompressed dump..."
  pg_restore -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean "$BACKUP_FILE"
fi

echo "Restore completed successfully!"
