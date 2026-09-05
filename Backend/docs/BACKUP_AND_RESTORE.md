# Backup & Restore Operations

The Vikas Inventory Backend utilizes customized bash scripts to securely and efficiently back up the PostgreSQL database in compressed binary formats.

## 1. Taking a Backup
To execute a backup, run the following command from the project root:
```bash
./scripts/backup-db.sh
```

**Output:**
- The script reads your `.env` connection details.
- It produces a `pg_dump` in Custom Format (`-Fc`).
- The payload is instantly compressed via `gzip` to save space.
- The resulting file is saved in the auto-generated `backups/` directory as `backup_YYYY-MM-DD_HH-MM-SS.dump.gz`.

**Pre-Deployment Safety:**
You **must** take a backup immediately before:
- Running `npm run migration:run`
- Executing major code deployments.
- Performing manual schema alterations.

## 2. Restoring a Backup
To restore data from an existing backup, pass the file path to the restore script:
```bash
./scripts/restore-db.sh backups/backup_2026-06-19_10-30-00.dump.gz
```

**Safety Protections:**
- The script automatically detects `.gz` compression and decompresses it into `pg_restore`.
- It executes `pg_restore --clean`, meaning it will **DROP** existing tables/data before restoring.
- **Verification Gate:** Before any destructive operation occurs, the script pauses, prints out the target Host, User, and Database, and forces you to explicitly type `RESTORE` to proceed. If you type anything else, it safely aborts.

## 3. VPS Retention Policy
To prevent VPS storage from filling up with old dumps over time, the following retention policy is highly recommended (this must currently be managed manually or via a separate devops cron job):

- **Daily Backups:** Keep the last 7
- **Weekly Backups:** Keep the last 4
- **Monthly Backups:** Keep the last 3

## 4. Git Ignore Rules
The `backups/` folder and `*.dump.gz` extensions are explicitly tracked in `.gitignore` to prevent massive binary blobs or highly sensitive production customer data from ever being committed to the source code repository.
