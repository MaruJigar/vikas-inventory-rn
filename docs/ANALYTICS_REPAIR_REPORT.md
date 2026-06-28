# Analytics Module Repair Report

## Root Cause
The root cause of the `QueryFailedError` and subsequent analytics failures was an outdated analytics module that was originally written against a legacy database schema. Over time, core entities like `WorkingDay`, `Order`, `ShopVisit`, and `ApprovalRequest` evolved (fields renamed or deleted, relations changed) but the raw query builder strings inside `AnalyticsService` were not updated.

## Files Modified
- `Backend/src/analytics/analytics.service.ts`

## Schema Mismatches Fixed

### 1. WorkingDay Entity
**Issue:** `AnalyticsService` queried `wd.check_in_time` and `wd.check_out_time`.
**Fix:** Updated references to match the current schema properties: `wd.check_in_at` and `wd.check_out_at`.

### 2. ShopVisit Entity
**Issue:** `AnalyticsService` calculated conversion rates by querying `visit.has_order = false`. The `has_order` column was deleted from the schema.
**Fix:** Updated the query to use the existing `visit.no_order_reason IS NOT NULL` to accurately determine visits without an order.

### 3. Order Entity (Revenue)
**Issue:** `AnalyticsService` referenced `order.total_amount` in sum and average calculations. The `total_amount` column was renamed.
**Fix:** Updated all aggregations (trends, totals, top performers) to use `order.final_order_amount`.

### 4. Salesman Entity Relation (Top Salesmen)
**Issue:** The `getOrdersAnalytics` method joined `salesman.user` and attempted to group by `user.id` to resolve `user.full_name`. The `Salesman` entity does not actually define a TypeORM `@ManyToOne` relation to `User`; it simply stores a `user_id` uuid string, causing the `user` relation join to fail.
**Fix:** Removed the invalid join. The `Salesman` entity now directly stores `full_name`. Grouping is now properly performed on `salesman.id` and `salesman.full_name`.

### 5. ApprovalRequest Entity
**Issue:** The `getApprovalsAnalytics` endpoint queried for `app.status = 'PENDING'`. The current schema uses `'PENDING_APPROVAL'` as the default state.
**Fix:** Adjusted the where clause to correctly aggregate `"SUM(CASE WHEN app.status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END)"`.

## Business Logic Verified
All complex logic structures were reviewed and preserved:
- **Average Working Hours:** Maintained the EPOCH extract math `AVG(EXTRACT(EPOCH FROM (wd.check_out_at - wd.check_in_at))/3600)`.
- **Visit Conversion Rate:** Safely preserved using the new `no_order_reason` predicate.
- **Top Distributors / Salesmen:** Re-implemented correct Postgres `GROUP BY` groupings (added `.addGroupBy('salesman.full_name')` and `.addGroupBy('distributor.business_name')` to satisfy strict grouping requirements while selecting aggregated amounts).
- **Backorder Value:** Retained the dummy backorder value calculation `SUM((b.quantity - b.resolved_quantity) * 100)` to ensure legacy behavior is not changed.
- **Role Isolation:** Validated that `applyOwnership()` logic properly references existing schema columns (`requester_user_id`, `distributor_id`, `salesman_id`). `SUPER_ADMIN` gracefully bypasses constraints to see a global view as originally intended.

## Performance Improvements
- **Strict Group By Cleanup:** Fixed `.groupBy()` clauses in QueryBuilder to use strict syntax that avoids Postgres evaluation errors on missing columns in aggregate queries.
- **Join Reduction:** Eliminated an unnecessary (and broken) `user` table join when querying Top Salesmen by leveraging denormalized `full_name` data.

## Remaining Recommendations
1. **Analytics Snapshots:** The `AnalyticsSnapshot` entity is defined but entirely unused. Heavy aggregation queries (using `SUM(CASE WHEN...)`) are executed synchronously in `Promise.all()`. A cron job should be implemented to cache historical analytics and reduce real-time computational load.
2. **SUPER_ADMIN Fallback Risk:** The `applyOwnership` method is fail-open. If a new, unhandled internal role is added, it will default to bypassing ownership filters and display all data. Consider refactoring `applyOwnership` to fail-close (i.e., return `0=1` or throw an error for unknown roles).
3. **Endpoint Clean-up:** The `GET /analytics/sales` endpoint currently proxies to `getWorkingDayAnalytics` which is technically incorrect data semantics, although the contract was preserved during this refactor. It should be aligned to true sales metrics.
