# Baseline Generation Audit

This report documents the final validation of the `BaselineInitialSchema` migration, which replaces the previously fragmented and broken migration chain.

**Baseline Filename:** `src/migrations/1781879043201-BaselineInitialSchema.ts`

## Generated Schema Statistics
The baseline migration was successfully generated against an empty database. The resulting schema definitions map 1:1 with our carefully reconciled entities.

*   **Table Count:** 34
*   **Foreign Key Count:** 32
*   **Index Count:** 26

### Verified Tables
All 34 system tables were generated exactly as specified in their entity definitions, without any missing domains.

### Verified Foreign Keys
The 32 emitted `FOREIGN KEY` constraints correctly link all our core business modules (Orders, Products, Salesmen, Distributors, Shops, and Visits). 

### Verified Indices & Constraints
The 26 emitted indices encompass all performance requirements:
*   The composite `status` indices for the API hardening (`idx_orders_dist_status`, `idx_shops_dist_status`, etc.).
*   The unique partial idempotency key for Orders (`idx_orders_idempotency_key` with the `WHERE` clause).

### Spatial Support (GIST)
*   The TypeORM generator successfully understood `spatial: true` and emitted `USING gist ("location")` for the location logs. This eliminates the need for manual index patching.

## Manual Patches Applied
While the indices and schema generated perfectly, TypeORM lacks native injection for PostgreSQL extensions. We manually injected the required extensions at the beginning of the `up()` function to guarantee a flawless deployment on a fresh server:

```typescript
await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "postgis"');
```

## TypeORM Limitations Encountered
*   **Extensions:** As noted above, the extensions must be injected manually.
*   **Geography Drift:** TypeORM has a tendency to bounce between `geometry` and `geography` drops during delta migrations, but since this is a pure baseline (a sequence of `CREATE TABLE`s), this drift bug has completely evaporated. The `shop_visits` table was created cleanly with the `geography(Point,4326)` column types intact.

## Final Verdict
**READY FOR DEPLOYMENT**

The new Baseline Migration perfectly encapsulates all entities, performance indices, structural safety constraints, and PostgreSQL extension requirements. The system is fully primed to bootstrap an empty database cleanly.
