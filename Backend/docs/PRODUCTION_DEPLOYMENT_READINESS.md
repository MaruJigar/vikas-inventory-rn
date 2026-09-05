# Production Deployment Readiness Audit

This document outlines the current state of the backend's deployment requirements, identifying necessary infrastructure, remaining risks, and standard operating procedures for a VPS deployment.

## Current Deployment State
The backend codebase is highly mature and hardened. It features strongly-typed environment validation, a stable TypeORM migration pipeline, resilient Redis queues, and extensive Prometheus telemetry. However, the repository lacks a production-ready process manager (e.g., `ecosystem.config.js`) and complete orchestration (e.g., Redis is missing from `docker-compose.yml`).

## Runtime Requirements
- **Node.js**: v20.x or v22.x LTS.
- **Package Manager**: npm.
- **Build Tool**: NestJS CLI (`npm run build`).

## Required Environment Variables
A `.env` file must be provisioned on the production server containing at minimum:
- `NODE_ENV=production`
- `PORT`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `METRICS_ENABLED=true`, `METRICS_TOKEN` (for Prometheus scraping)
- `QUEUE_ENABLED=true`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

## Database Requirements
- **Engine**: PostgreSQL 15+ with PostGIS extensions (currently configured as `postgis/postgis:15-3.3` in local docker).
- **Network**: Should be isolated within a VPC or bound to `localhost` if on a single VPS.

## Redis Requirements
- **Engine**: Redis 6+ (required for BullMQ).
- **State**: The current `docker-compose.yml` *does not* include Redis. It must be added to the production stack or provisioned externally.

## Storage Requirements
- **Uploads**: The API stores files locally at `process.cwd() + (process.env.UPLOAD_ROOT || 'storage/uploads')`.
- **Volume**: A persistent disk volume must be mounted to this path to survive container restarts or PM2 reloads.

## Process Manager Requirements
- **Missing**: There is no `ecosystem.config.js` for PM2.
- **Requirement**: PM2 or Docker must be used to ensure the Node process automatically restarts on failure and utilizes cluster mode for zero-downtime reloads.

## Reverse Proxy Requirements
- **Engine**: Nginx or Caddy.
- **Purpose**: To handle SSL termination, serve static files (from `/uploads`), and proxy `/` to the Node.js application running on `PORT`. Needs configuration to support WebSockets (upgrade headers).

## SSL Requirements
- **Requirement**: Let's Encrypt (Certbot) must be installed to secure API and WebSocket (`wss://`) traffic.

## Monitoring Requirements
- **Scraping**: A Prometheus server is recommended to scrape `GET /metrics` every 15 seconds using the `METRICS_TOKEN`.
- **Alerting**: Set up alerts for the `http_errors_total` and `notification_failures_total` gauges.

## Backup Requirements
- **Tools**: The repository contains `scripts/backup-db.sh`.
- **Automation**: A cron job must be established on the VPS to execute this script daily and ideally offload the `.dump` file to an S3 bucket.

## Migration Workflow
1. Execute `npm install`
2. Execute `npm run build`
3. Execute `npm run migration:run` (Requires `DB_*` environment variables)
4. Execute `npm run start:prod` or `pm2 reload`

## Deployment Workflow
For a standard single-node VPS (e.g., DigitalOcean Droplet, AWS EC2):
1. `git pull origin main`
2. Run the Migration Workflow.
3. Restart the process manager.

## Rollback Workflow
1. Identify the previous stable git commit.
2. Run `npm run migration:revert` if the bad deployment included a breaking schema change.
3. `git checkout <commit_hash>`
4. `npm run build && pm2 reload ecosystem.config.js`
Alternatively, restore the database from `scripts/restore-db.sh`.

## Remaining Risks

### 1. Missing Process Orchestration
- **Severity**: High
- **Impact**: Node.js is single-threaded. Without PM2 or a Docker Swarm/K8s setup, an unhandled exception (outside of NestJS HTTP filters) will crash the entire server.
- **Mitigation**: Create an `ecosystem.config.js` file defining memory limits, cluster mode, and log rotation.

### 2. Ephemeral Local Storage
- **Severity**: High
- **Impact**: If the VPS dies or if the app scales to multiple nodes, user uploads inside `storage/uploads` will be lost or fragmented.
- **Mitigation**: Offload uploads to AWS S3 / Cloudflare R2, or ensure rigorous volume backups.

### 3. Missing Redis in Docker Stack
- **Severity**: Medium
- **Impact**: The queue infrastructure cannot run out-of-the-box using the provided `docker-compose.yml`.
- **Mitigation**: Add a `redis:alpine` service to the compose file.

### 4. Legacy Test Suite Failures
- **Severity**: Low (for runtime), High (for CI/CD)
- **Impact**: The CI pipeline currently uses `continue-on-error: true` because 41 tests fail. Broken code could sneak into production.
- **Mitigation**: Resolve the failing unit tests in `visit.service` and `order.service`.

## VPS Recommendation
For the initial launch:
- **Specs**: 2 vCPUs, 4GB RAM minimum (Node.js + Postgres + Redis).
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS.
- **Stack**: Nginx (Reverse Proxy/SSL), PM2 (Node Process), Docker (Postgres + Redis).
