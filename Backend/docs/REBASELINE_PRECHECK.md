# Rebaseline Precheck Audit

This document outlines the risks, hidden schema objects, and strategy for replacing the fragmented TypeORM migration history with a single master baseline.

## Audit Findings: Schema Object Drift

We audited the existing 6 migration files to identify manual schema modifications (`ALTER TABLE`, `CREATE INDEX`, `REFERENCES`) that are currently **missing** from the actual `.entity.ts` files. Because TypeORM uses entity files to generate migrations, any manual SQL not represented by a decorator will be permanently lost during a baseline generation.

### 🟢 Objects Safely Represented (Will Survive)
- **Table Structures**: The 38 tables and their column data types.
- **`working_days` Partial Index**: The `idx_unique_active_wd` index has a correct `@Index({ where: "status = 'ACTIVE'" })` decorator.
- **Some Foreign Keys**: Entities like `shop_visits` correctly utilize `@ManyToOne()` decorators, so TypeORM will regenerate their foreign keys.

### 🔴 Objects Missing from Entities (Will Be Lost)

If a baseline migration were generated right now, the following critical database constraints and performance optimizations would be erased:

1. **Order Module Referential Integrity**
   - **Missing `@ManyToOne`**: The entire Orders module (`order.entity.ts`, `order-item.entity.ts`, `backorder.entity.ts`, `fulfillment-log.entity.ts`) defines foreign keys (like `shop_id`, `salesman_id`) using simple `@Column({ type: 'uuid' })`. There are no `@ManyToOne` relationships defined. 
   - **Impact**: All foreign key constraints (`REFERENCES "shops"("id")`) added manually in `1781416495400-Orders.ts` will be wiped out. The database will lose referential integrity for orders.

2. **API Hardening Indices (18 Indexes)**
   - **Missing `@Index`**: The `1781444417776-ListApiHardeningIndices.ts` migration created 18 composite performance indexes across `products`, `orders`, `shop_visits`, `salesmen`, etc. 
   - **Impact**: None of these exist as `@Index()` decorators in the entities. The production database will suffer massive performance degradation.

3. **GIST Spatial Indexes**
   - **Missing `@Index`**: Migration `1700000000001-LocationTracking.ts` manually executed `CREATE INDEX ... USING GIST ("location")` on `location_logs`.
   - **Impact**: `location-log.entity.ts` lacks the `@Index` decorator. Without a GIST index, `ST_DWithin` spatial queries will trigger full-table scans.

4. **Partial Unique Constraints**
   - **Missing `@Index`**: Migration `1781416495400-Orders.ts` executed a partial unique index on `orders.idempotency_key` (`WHERE idempotency_key IS NOT NULL`).
   - **Impact**: The `order.entity.ts` does not contain this index decorator.

5. **PostgreSQL Extensions**
   - **Missing `CREATE EXTENSION`**: TypeORM auto-generation does not prepend `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` or `postgis`.
   - **Impact**: The generated migration will crash on execution when it hits `uuid_generate_v4()` or `geometry` column types.

## Recommended Rebaseline Strategy

To safely replace the migration chain without destroying database integrity and performance, the following sequence **must** be followed:

### Phase 1: Entity Reconciliation
Before deleting any migrations, we must inject the missing schema metadata into the codebase:
1. Add `@ManyToOne()` and `@JoinColumn()` to `orders`, `order_items`, `backorders`, etc., to restore foreign keys.
2. Add the 18 missing `@Index()` decorators for the API Hardening composite indexes.
3. Add the missing `@Index('...', { where: "idempotency_key IS NOT NULL", unique: true })` to `order.entity.ts`.
4. (Note: TypeORM currently struggles to auto-generate GIST indexes for PostGIS natively, this will require manual intervention in Phase 3).

### Phase 2: Generation
1. Delete the `src/migrations/` folder.
2. Point TypeORM to an empty PostgreSQL/PostGIS database.
3. Run `npm run migration:generate -- -n BaselineInitialSchema`.

### Phase 3: Manual Baseline Patching
1. Open the newly generated `BaselineInitialSchema` file.
2. Prepend `await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');`
3. Prepend `await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "postgis"');`
4. Append `await queryRunner.query('CREATE INDEX "idx_location_logs_location" ON "location_logs" USING GIST ("location")');` to the `up()` method.
5. Commit the new Baseline.
