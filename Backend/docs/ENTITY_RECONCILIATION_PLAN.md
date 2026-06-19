# Entity Reconciliation Plan

This document serves as the exact roadmap for Phase 1 of the Migration Rebaseline. We have cross-referenced the current migration state with the `.entity.ts` schemas, DTOs, and application logic to map out exactly what needs to be added to the TypeORM entities before generating a baseline.

## 1. Missing Foreign Key Relationships
The application is currently heavily dependent on raw UUID columns (e.g. `shop_id: string`) without matching `@ManyToOne` decorators. If we baseline now, the database will lack referential integrity constraints, leading to orphaned rows.

**Required Additions:**
*Each of the following must have a `@ManyToOne(() => TargetEntity)` and `@JoinColumn({ name: '..._id' })` added.*

- **Order Module**:
  - `Order`: `visit_id` (ShopVisit), `shop_id` (Shop), `salesman_id` (Salesman), `distributor_id` (Distributor), `manufacturer_id` (Manufacturer), `cancelled_by_user_id` (User).
  - `OrderItem`: `order_id` (Order), `product_id` (Product).
  - `Backorder`: `order_id` (Order), `order_item_id` (OrderItem), `product_id` (Product), `distributor_id` (Distributor).
  - `OrderRevision` & `OrderStatusHistory`: `order_id` (Order), `changed_by_user_id` (User).
  - `FulfillmentLog`: `order_id` (Order), `order_item_id` (OrderItem), `distributor_id` (Distributor), `performed_by_user_id` (User).
- **Product Module**:
  - `Product`: `manufacturer_id` (Manufacturer), `distributor_id` (Distributor), `category_id` (ProductCategory), `created_by_user_id` (User).
  - `ProductCategory`: `parent_id` (ProductCategory).
- **Shop & Sales Module**:
  - `ShopDuplicateLog`: `distributor_id` (Distributor), `matched_shop_id` (Shop), `created_by_user_id` (User).

*Reasoning*: TypeORM generates `ALTER TABLE ADD CONSTRAINT FOREIGN KEY` strictly based on `@ManyToOne`/`@OneToOne` decorators. Raw `@Column({ type: 'uuid' })` fields are treated as standard scalar values.

## 2. Missing Indexes
The `1781444417776` hardening migration manually created 18 crucial performance indices. Because these were never added to the `.entity.ts` files via `@Index()`, they are invisible to TypeORM's generator.

**Required Additions:**
Add `@Index('index_name', ['col1', 'col2'])` to the class level of the following entities:

- `Product`: `['manufacturer_id', 'category_id']`, `['created_at']`
- `Order`: `['shop_id', 'status']`, `['salesman_id', 'status']`, `['distributor_id', 'status']`, `['created_at']`
- `DistributorInventory`: `['distributor_id', 'product_id']`
- `Backorder`: `['distributor_id', 'status']`, `['created_at']`
- `ShopVisit`: `['distributor_id', 'status']`, `['salesman_id', 'status']`, `['created_at']`
- `Salesman`: `['distributor_id', 'approval_status']`, `['created_at']`
- `Shop`: `['distributor_id', 'verification_status']`, `['created_at']`
- `ApprovalRequest`: `['distributor_id', 'status']`, `['manufacturer_id', 'status']`, `['created_at']`
- `Notification`: `['recipient_user_id', 'is_read']`, `['created_at']`

## 3. Missing Spatial & Partial Constraints
TypeORM auto-generation cannot perfectly infer partial constraints and spatial constraints from raw decorators without explicitly configuring the `@Index()` attributes.

**Required Additions:**
- **Partial Unique Index**: In `order.entity.ts`, add `@Index('idx_orders_idempotency_key', ['idempotency_key'], { unique: true, where: "idempotency_key IS NOT NULL" })` at the class level.
- **GIST Index**: In `location-log.entity.ts`, we need to attempt `@Index('idx_location_logs_location', ['location'], { spatial: true })`.

## 4. Manual Baseline Additions (Post-Generation)
Because of TypeORM's limitations regarding extensions and advanced PostGIS syntax, the generated baseline file **must** be manually patched before execution.

**Required Manual Injections:**
Inside the `up()` method of the future Baseline migration, we must prepend:
```typescript
await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "postgis"');
```

If TypeORM fails to correctly translate the spatial index into a `USING GIST` statement, we must also manually inject:
```typescript
await queryRunner.query('CREATE INDEX "idx_location_logs_location" ON "location_logs" USING GIST ("location")');
```

## Risk Assessment
- **Severity**: Critical.
- **Impact**: If we fail to completely reconcile these entities prior to rebaselining, we will deploy a database to the VPS that accepts orphaned records, runs `O(N)` full-table scans for spatial and filtered queries, and fails to reject duplicate idempotent requests.
- **Mitigation**: Execute the exact checklist below.

## Execution Checklist
- [ ] Inject `@ManyToOne` across Orders, Products, and Shop entities.
- [ ] Inject 18 composite `@Index` decorators for the API Hardening.
- [ ] Inject the partial unique `@Index` on `orders.idempotency_key`.
- [ ] Validate `npm run build` passes with no cyclical dependency issues.
- [ ] *Then* delete `src/migrations`.
- [ ] *Then* generate the baseline.
- [ ] *Then* manually inject `CREATE EXTENSION`.
