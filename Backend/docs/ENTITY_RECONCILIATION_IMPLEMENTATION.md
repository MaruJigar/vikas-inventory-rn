# Entity Reconciliation Implementation Report

This report documents the completion of Phase 1 of the Migration Rebaseline process. We have successfully reconciled the TypeORM entity files with the intended database schema constraints that were previously hidden inside manual migration scripts.

## Modified Files
The following entity files were modified to introduce `@ManyToOne` relationships, `@JoinColumn` mappings, and `@Index` decorators:
- `src/order/order.entity.ts`
- `src/order/order-item.entity.ts`
- `src/order/backorder.entity.ts`
- `src/order/order-revision.entity.ts`
- `src/order/order-status-history.entity.ts`
- `src/order/fulfillment-log.entity.ts`
- `src/product/product.entity.ts`
- `src/product/product-category.entity.ts`
- `src/shop-duplicate-detection/shop-duplicate-log.entity.ts`
- `src/inventory/distributor-inventory.entity.ts`
- `src/visit/shop-visit.entity.ts`
- `src/salesman/salesman.entity.ts`
- `src/shop/shop.entity.ts`
- `src/approval/approval-request.entity.ts`
- `src/notification/notification.entity.ts`
- `src/location/location-log.entity.ts`

## Restored Relationships
The `order`, `product`, and `shop` modules now correctly define structural Foreign Key relationships. This ensures referential integrity will be established during baseline generation.
- **Order Module**: Added relations for `visit`, `shop`, `salesman`, `distributor`, `manufacturer`, `cancelled_by_user`, `product`, `order_item`, `performed_by_user`, and `changed_by_user`.
- **Product Module**: Added relations for `manufacturer`, `distributor`, `category`, `parent` (self-referential), and `created_by_user`.
- **Shop Duplicate Log**: Added relations for `distributor`, `matched_shop`, and `created_by_user`.

## Restored Indices & Constraints
The 18 missing API Hardening indices, idempotency constraints, and spatial indices have been formally added to their respective entities.
- **Composite API Indices**: Restored to `Product`, `Order`, `DistributorInventory`, `Backorder`, `ShopVisit`, `Salesman`, `Shop`, `ApprovalRequest`, and `Notification`.
- **Idempotency**: Added partial unique constraint to `orders` (`idx_orders_idempotency_key`).
- **Spatial Support**: Added spatial index metadata to `location_logs.location` (`idx_location_logs_location`).

## Unresolved TypeORM Limitations
TypeORM's ability to perfectly generate GIST indexes for `geography(Point)` types or to automatically include PostgreSQL extensions is notoriously brittle. 
When generating the baseline in Phase 2, we must manually prepend:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```
Additionally, if the `migration:generate` output fails to correctly format `idx_location_logs_location` as `USING GIST`, it must be manually fixed.

## Validation Status
✅ `npm run build` executed successfully.
The introduction of cyclic class relationships between modules (e.g., `Order` -> `Shop` and potentially vice-versa) did not cause any build failures because the relationships were implemented using lazy-evaluated callbacks (`() => TargetEntity`).

## Next Steps
The repository is now fully prepared for Phase 2.
We are ready to delete the `src/migrations` folder and execute the `migration:generate` command.
