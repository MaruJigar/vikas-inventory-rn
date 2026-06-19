# Migration Integrity Audit

This report evaluates the current TypeORM migration history to determine if the repository can successfully bootstrap an empty PostgreSQL database for a production deployment.

## Current State & Finding
**Status: FATAL (Cannot Bootstrap)**

The repository historically relied on TypeORM's `synchronize: true` for schema evolution. The current `src/migrations` folder contains only 6 migration files. These files represent recent "delta" changes rather than a complete database definition. Attempting to run `npm run migration:run` on an empty database will immediately fail because foundational tables are completely missing from the migration chain.

## Migration File Analysis

1. **`1700000000000-UpdateWorkingDay.ts`**
   - **Assumes Existing**: `working_days` table.
   - **Action**: Runs `addColumn` for `idempotency_key` and creates an index.
   - **Failure Point**: Fails immediately on a fresh DB because `working_days` does not exist.

2. **`1700000000001-LocationTracking.ts`**
   - **Assumes Existing**: PostGIS extension and `uuid-ossp` extension.
   - **Action**: Creates `location_logs` and `latest_locations`.

3. **`1781416495369-ShopVisit.ts`**
   - **Assumes Existing**: `salesmen`, `distributors`, `shops`, `working_days` tables.
   - **Action**: Creates `shop_visits` table with foreign keys referencing the above tables.
   - **Failure Point**: Fails creating Foreign Keys because the target tables do not exist.

4. **`1781416495400-Orders.ts`**
   - **Assumes Existing**: `shop_visits`, `shops`, `salesmen`, `distributors`, `manufacturers`, `users`, `products` tables.
   - **Action**: Creates `orders`, `order_items`, `order_revisions`, `order_status_history`, `backorders`, `fulfillment_logs`.

5. **`1781421369058-ApprovalWorkflow.ts`**
   - **Action**: Successfully creates `approval_requests` and `approval_logs`.

6. **`1781444417776-ListApiHardeningIndices.ts`**
   - **Assumes Existing**: `products`, `distributor_inventory`, `notifications`, `salesmen`, `shops`, etc.
   - **Action**: Creates performance indices on those tables.

## Entity-to-Migration Drift
There are currently **38** distinct `@Entity()` definitions in the codebase.
The migrations only contain `CREATE TABLE` scripts for **11** of them.

### Missing Bootstrap Tables
The following 27 core tables exist *only* in TypeORM's entity metadata and will **never** be created during a standard migration run:
- `users`, `roles`, `permissions`, `role_permissions`
- `shops`, `distributors`, `manufacturers`, `salesmen`
- `products`, `product_categories`, `product_price_history`
- `distributor_inventory`, `inventory_movements`
- `working_days`
- `notifications`, `audit_logs`
- `offline_sync_batches`, `offline_sync_items`
- *...and several more.*

## Recommended Long-Term Strategy
Because we have formally disabled `synchronize: true` for production safety, we **must** repair the migration chain before deploying to the VPS.

### Action Plan: "Squash and Rebaseline"
1. **Clear Existing Migrations**: Delete all 6 files currently in `src/migrations`. (Assuming the production database does not actually exist yet, or we don't care about preserving this specific migration chain on existing dev DBs).
2. **Generate Baseline**: Run `npm run migration:generate -- -n BaselineInitialSchema` against an empty PostgreSQL/PostGIS database. TypeORM will read all 38 entities and generate a single, massive, 100% accurate `CREATE TABLE` script that represents the entire application schema at this exact moment.
3. **Commit**: Save this as the new immutable foundation. All future schema changes will be cleanly generated on top of this single baseline file.

*Warning: If there is already a live database holding data based on `synchronize: true`, we must generate this baseline but manually `INSERT` a record into the `migrations` table of the live database so TypeORM considers the baseline "already executed".*
