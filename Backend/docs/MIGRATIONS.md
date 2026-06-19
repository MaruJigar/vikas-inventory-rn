# TypeORM Migration Strategy

The Vikas Inventory Backend uses a formalized TypeORM migration strategy.

**`synchronize: true` is strictly disabled in production.** The application requires explicit migrations to be executed against the database before starting the API server on any new deployment.

## Deployment Workflow
In your CI/CD pipeline or VPS deployment scripts, follow this exact sequence:

1. **Deploy Code:** Pull the latest code and install dependencies.
2. **Build API:** `npm run build`
3. **Run Migrations:** `npm run migration:run`
4. **Start API:** `npm run start:prod` (e.g., using PM2, Docker, etc.)

*Why run migrations before starting the app?* 
The backend must never serve API requests using an out-of-date database schema. Running migrations synchronously before boot guarantees data integrity.

## Migration Commands

### Generate a Migration
When you modify an `.entity.ts` file, you must generate a migration file representing those changes.
```bash
npm run migration:generate src/migrations/DescriptionOfChange
```
*Note: This command connects to the database, compares your entities to the actual schema, and generates the required SQL commands.*

### Create an Empty Migration
If you need to write manual SQL (e.g., complex data backfills or dropping columns safely), create an empty migration file.
```bash
npm run migration:create src/migrations/ManualDataFix
```

### Run Pending Migrations
Applies any migration files that have not yet been executed in the database.
```bash
npm run migration:run
```

### Revert Last Migration
Reverts the very last migration that was run. Useful for local development when a mistake was made.
```bash
npm run migration:revert
```

## Local Development vs Production
In `development` (`NODE_ENV=development`), NestJS currently allows `synchronize: true` for rapid iteration. However, when writing features, you should eventually turn synchronization off or trust the migration generation to capture your entity changes before committing.

In `production` (`NODE_ENV=production`), `synchronize: false` is permanently hardcoded. If you forget to run `npm run migration:run`, the API will simply crash if it queries missing columns. This is the desired safe behavior.
