# Dashboard API Audit Report

## 1. Locate Dashboard Module
The Dashboard functionality is implemented within the `analytics` module. The following files are related to the dashboard and analytics functionality:

- `Backend/src/analytics/analytics.module.ts`
- `Backend/src/analytics/analytics.controller.ts`
- `Backend/src/analytics/analytics.service.ts`
- `Backend/src/analytics/analytics.controller.spec.ts`
- `Backend/src/analytics/analytics.service.spec.ts`
- `Backend/src/analytics/analytics-snapshot.entity.ts`
- `Backend/src/analytics/dto/analytics-query.dto.ts`

---

## 2. List Every Dashboard Endpoint

### `GET /analytics/dashboard`
- **Controller Method:** `getDashboard()`
- **Service Method:** `getDashboard()`
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`, `SALESMAN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`
- **Swagger Decorators:** `@ApiOperation({ summary: 'Get Dashboard' })`, `@ApiBearerAuth('bearer')`, `@ApiTags('Analytics')`

### `GET /analytics/sales`
- **Controller Method:** `getSales()`
- **Service Method:** `getWorkingDayAnalytics()` *(Note: Currently calls working day analytics instead of sales)*
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`, `SALESMAN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`

### `GET /analytics/visits`
- **Controller Method:** `getVisits()`
- **Service Method:** `getVisitsAnalytics()`
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`, `SALESMAN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`

### `GET /analytics/orders`
- **Controller Method:** `getOrders()`
- **Service Method:** `getOrdersAnalytics()`
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`, `SALESMAN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`
- **Validation:** Uses `AnalyticsQueryDto` via `@Query()` parameter.

### `GET /analytics/inventory`
- **Controller Method:** `getInventory()`
- **Service Method:** `getInventoryAnalytics()`
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`

### `GET /analytics/backorders`
- **Controller Method:** `getBackorders()`
- **Service Method:** `getBackordersAnalytics()`
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`

### `GET /analytics/fulfillment`
- **Controller Method:** `getFulfillment()`
- **Service Method:** `getFulfillmentAnalytics()`
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`, `SALESMAN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`

### `GET /analytics/approvals`
- **Controller Method:** `getApprovals()`
- **Service Method:** `getApprovalsAnalytics()`
- **Required Roles:** `SUPER_ADMIN`, `MANUFACTURER_ADMIN`, `DISTRIBUTOR_ADMIN`, `SALESMAN`
- **Authentication Required:** Yes
- **Guards Applied:** `JwtAuthGuard`, `RolesGuard`

---

## 3. Response Structure

The `/analytics/dashboard` endpoint acts as an aggregator, returning the exact structures provided by the individual endpoints:

```json
{
  "workingDay": {
    "activeSalesmen": 15,          // number, total salesmen tracked
    "checkedInToday": 12,          // number, salesmen checked in today
    "checkedOutToday": 5,          // number, salesmen checked out today
    "averageWorkingHours": "6.50"  // string (fixed to 2 decimals)
  },
  "visits": {
    "totalVisits": 120,            // number
    "activeVisits": 10,            // number
    "completedVisits": 90,         // number
    "noOrderVisits": 30,           // number
    "visitConversionRate": 66.67   // number (percentage)
  },
  "orders": {
    "totals": {
      "totalOrders": 240,          // number
      "totalRevenue": 15230.50,    // number
      "averageOrderValue": "63.46" // string (fixed to 2 decimals)
    },
    "statusDistribution": [
      {
        "status": "CONFIRMED",     // string
        "count": 140               // number
      }
    ],
    "trends": [
      {
        "date": "2023-10-01",      // string
        "orderCount": 45,          // number
        "revenue": 5300            // number
      }
    ],
    "topSalesmen": [
      {
        "name": "John Doe",        // string, source: user.full_name
        "orderCount": 50,          // number
        "revenue": 5000            // number
      }
    ],
    "topDistributors": [
      {
        "name": "ABC Corp",        // string, source: distributor.business_name
        "orderCount": 190,         // number
        "revenue": 10230           // number
      }
    ]
  },
  "fulfillment": {
    "ordersPendingDispatch": 45,   // number
    "ordersDispatched": 30,        // number
    "ordersDelivered": 150,        // number
    "partialDeliveries": 10        // number
  },
  "inventory": {
    "lowStockProducts": 14,        // number, items with qty <= 10
    "backorderedProducts": 5,      // number
    "inventoryAdjustments": 24     // number
  },
  "backorders": {
    "openBackorders": 8,           // number
    "resolvedBackorders": 12,      // number
    "backorderValue": 1500         // number (dummy calculation in service)
  },
  "approvals": {
    "pendingApprovals": 3,         // number
    "approvedToday": 5,            // number
    "rejectedToday": 1             // number
  },
  "notifications": {
    "unreadNotifications": 4       // number
  }
}
```

---

## 4. Data Sources

- **workingDay metrics:** -> `WorkingDay` entity (`working_days` table).
- **visits metrics:** -> `ShopVisit` entity (`shop_visits` table).
- **orders metrics:** -> `Order` entity (`orders` table), joining with `Salesman`/`User` and `Distributor`.
- **fulfillment metrics:** -> `Order` entity (`orders` table) based on status.
- **inventory metrics:** -> `DistributorInventory` entity (`distributor_inventory` table) and `InventoryMovement` (`inventory_movements` table).
- **backorders metrics:** -> `Backorder` entity (`backorders` table).
- **approvals metrics:** -> `ApprovalRequest` entity (`approval_requests` table).
- **notifications metrics:** -> `Notification` entity (`notifications` table).

---

## 5. Database Queries

The application relies heavily on `TypeORM QueryBuilder` and dynamic raw SQL subqueries for role-based isolation.

### Aggregations used:
- **COUNT:** Used for total active elements, order counts, unread notifications.
- **SUM(CASE WHEN ... THEN 1 ELSE 0 END):** Widely used across all modules to pivot statuses into columns (e.g., `checked_in_today`, `active_visits`, `orders_dispatched`, `low_stock`).
- **AVG:** Used for `average_order_value` and average working hours.

### Notable Calculations:
- **Average Working Hours:** 
  `AVG(EXTRACT(EPOCH FROM (wd.check_out_time - wd.check_in_time))/3600)`
- **Visit Conversion Rate:** 
  Calculated in memory: `((completed - noOrderVisits) / completed) * 100`

### Ownership Subqueries:
The `applyOwnership` function injects `AND WHERE x IN (SELECT ...)` subqueries dynamically based on the user's role (`DISTRIBUTOR_ADMIN`, `SALESMAN`, `MANUFACTURER_ADMIN`).

### GROUP BY Usage:
In `getOrdersAnalytics`, `GROUP BY` is used for:
- `order.status` (Status distribution)
- `DATE(order.created_at)` (Daily trends)
- `user.id` (Top Salesmen)
- `distributor.id` (Top Distributors)

---

## 6. Metrics Generated

1. **Working Days:** Active Salesmen, Checked In Today, Checked Out Today, Average Working Hours.
2. **Visits:** Total Visits, Active Visits, Completed Visits, No-Order Visits, Visit Conversion Rate.
3. **Orders:** Total Orders, Total Revenue, Average Order Value.
4. **Order Status Distribution:** Count per order status.
5. **Trends:** Daily order count, Daily revenue.
6. **Top Performers:** Top 5 Salesmen, Top 5 Distributors.
7. **Fulfillment:** Orders Pending Dispatch, Orders Dispatched, Orders Delivered, Partial Deliveries.
8. **Inventory:** Low Stock Products (qty <= 10), Backordered Products, Inventory Adjustments.
9. **Backorders:** Open Backorders, Resolved Backorders, Backorder Value.
10. **Approvals:** Pending Approvals, Approved Today, Rejected Today.
11. **Notifications:** Unread Notifications count.

---

## 7. Charts

The `/analytics/orders` endpoint provides extensive data structures intended for frontend charts:
- **Status Distribution:** Suitable for Pie/Doughnut charts. Labels: status, Series: count.
- **Revenue/Orders Trends:** Suitable for Line/Bar charts. Labels: `date` (Daily), Series: `orderCount`, `revenue`.
- **Top Salesmen:** Suitable for Horizontal Bar charts. Labels: Salesman Name, Series: Order Count & Revenue.
- **Top Distributors:** Suitable for Horizontal Bar charts. Labels: Distributor Name, Series: Order Count & Revenue.

*Note: Time interval for trends is hardcoded to Daily.*

---

## 8. Role-wise Dashboard

Data is isolated based on the authenticated user's role via the `applyOwnership` method:
- **SUPER_ADMIN:** Not explicitly handled in `applyOwnership`, meaning they have unrestricted access and see aggregate metrics for the entire platform.
- **MANUFACTURER_ADMIN:** Sees data restricted to their mapped distributors (using `manufacturer_distributors` table).
- **DISTRIBUTOR_ADMIN:** Sees data localized strictly to their `distributor_id`.
- **SALESMAN:** Sees data restricted to their own `salesman_id`. 
  - *Note:* Salesmen cannot access the `/analytics/inventory` or `/analytics/backorders` endpoints due to `@Roles` guard restrictions.

---

## 9. Filters

Filters are severely limited currently. 
- Only the `/analytics/orders` endpoint supports query filters.
- Supported filters via `AnalyticsQueryDto`: 
  - `startDate` (ISO Date string)
  - `endDate` (ISO Date string)
- Other endpoints do not accept timeframe filters and calculate all-time metrics or are hardcoded to "Today".

---

## 10. Business Logic

- **Visit Success Rate (Conversion):** Total completed visits minus visits where `has_order = false`. The remainder is divided by total completed visits.
- **Low Stock Threshold:** Hardcoded to `available_quantity <= 10`.
- **Backorder Value:** Calculated as `(quantity - resolved_quantity) * 100`. *Warning: 100 is a dummy value hardcoded in the query.*
- **Approved/Rejected Today:** Handled using `updated_at >= :today`.

---

## 11. Performance

- **N+1 Avoidance:** `getDashboard()` runs 8 heavy database queries concurrently using `Promise.all()`, which is good for parallelizing but resource-intensive.
- **Repeated Subqueries:** The `applyOwnership` logic injects raw SQL subqueries. In `/analytics/orders`, the `orderRepo` is cloned 5 times, executing the exact same ownership subquery 5 separate times.
- **Slow Aggregations:** `EXTRACT(EPOCH FROM ...)` for working hours calculates metrics on the fly. This will become a bottleneck as the `working_days` table grows.
- **Missing Snapshot Implementation:** There is an `analytics_snapshots` entity that could be used for caching expensive daily metrics, but it is entirely unused in the service.

---

## 12. Missing APIs

- **Products Module exists ↓**
  - Missing: Top Selling Products, Category Performance.
- **Shops Module exists ↓**
  - Missing: Top Performing Shops, Inactive Shops (no visits in X days).
- **Billing Module exists ↓**
  - Missing: Outstanding Balances, Collections Today, Payment Trends.
- **Sales API is incorrect ↓**
  - `/analytics/sales` is returning working day metrics due to a hardcoded placeholder call.

---

## 13. Frontend Readiness

- **Next.js Admin Panel:** **Partially Ready.** High-level metrics and isolated roles work perfectly. However, missing pagination on top performers, and lack of flexible filtering (e.g., filtering by a specific distributor) will block advanced reporting features.
- **React Native Salesman App:** **Partially Ready.** Standard metrics (orders, visits) work well. However, salesmen might need access to inventory availability metrics, which are currently restricted by Guards.

---

## 14. API Documentation

| Method | Endpoint | Purpose | Roles | Status |
|---------|----------|---------|-------|--------|
| GET | `/analytics/dashboard` | Aggregated dashboard metrics | SA, MA, DA, S | Ready |
| GET | `/analytics/sales` | Sales specific metrics | SA, MA, DA, S | **Broken** |
| GET | `/analytics/visits` | Visit conversion and active count | SA, MA, DA, S | Ready |
| GET | `/analytics/orders` | Totals, trends, and top performers | SA, MA, DA, S | Ready |
| GET | `/analytics/inventory`| Low stock and adjustments | SA, MA, DA | Ready |
| GET | `/analytics/backorders`| Open vs resolved backorders | SA, MA, DA | Ready |
| GET | `/analytics/fulfillment`| Dispatch and delivery states | SA, MA, DA, S | Ready |
| GET | `/analytics/approvals` | Approval statuses (Pending, etc.) | SA, MA, DA, S | Ready |

*(SA=Super Admin, MA=Manufacturer Admin, DA=Distributor Admin, S=Salesman)*

---

## 15. DTO Audit

**`AnalyticsQueryDto`**
- `startDate` (Optional, `@IsDateString()`)
- `endDate` (Optional, `@IsDateString()`)
- **Missing:**
  - `distributorId`
  - `salesmanId`
  - `shopId`
  - Validation decorator to ensure `startDate` is before `endDate`.

---

## 16. Security Audit

- **Fail-Open Risk:** The `applyOwnership` function checks specifically for `DISTRIBUTOR_ADMIN`, `SALESMAN`, and `MANUFACTURER_ADMIN`. If a new internal role is added to the system (or if `SUPER_ADMIN` logic changes unintentionally), it will default to bypassing the `andWhere` clauses entirely, exposing all system data.
- **SQL Injection Safety:** Ownership subqueries use parameterization (`:userId`), effectively mitigating SQL injection risks in the raw query strings.

---

## 17. Integration Audit

- **Integrates with:** `Users`, `Orders`, `Inventory`, `Visits`, `Working Days`, `Approvals`, `Notifications`, `Backorders`.
- **Missing Integration:** `Shops` (no shop health/activity metrics), `Products` (no product volume metrics), `Billing` (no revenue collection metrics), `Cron Jobs` (caching metrics to the snapshot entity), `Socket Gateway` (no live dashboard updates).

---

## 18. Overall Completion

**Overall Dashboard Completion: ~65%**

- **Infrastructure:** 100% (Controllers, Services, DTOs in place).
- **Authentication:** 100% (Guards and Bearer tokens fully functional).
- **Basic Metrics:** 80% (Broad coverage, but `/sales` endpoint is improperly wired and dummy values are used for backorder value).
- **Charts:** 40% (Available for orders, but hardcoded to daily aggregation with no flexibility).
- **Filters:** 20% (Only date filters, and only applied to the `/orders` endpoint).
- **Role-wise Dashboards:** 90% (Good data isolation, but restrictive for salesmen regarding inventory).
- **Analytics Caching:** 0% (Snapshot entity exists but is entirely unused, which will lead to scaling issues).
