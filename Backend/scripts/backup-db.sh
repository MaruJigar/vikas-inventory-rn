#!/bin/bash
set -e

# Change to the directory containing this script
cd "$(dirname "$0")/.."

# Ensure backups directory exists
mkdir -p backups

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found."
  exit 1
fi

# Set defaults if not provided in .env
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-vikas_inventory}

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="backup_${TIMESTAMP}.dump.gz"
FILEPATH="backups/${FILENAME}"

echo "Starting PostgreSQL backup for database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}..."

# pg_dump requires password in PGPASSWORD
export PGPASSWORD=${DB_PASS}

# Dump in Custom format (-Fc) and compress immediately with gzip
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -Fc "${DB_NAME}" | gzip > "${FILEPATH}"

echo "Backup completed successfully!"
echo "Saved to: ${FILEPATH}"
