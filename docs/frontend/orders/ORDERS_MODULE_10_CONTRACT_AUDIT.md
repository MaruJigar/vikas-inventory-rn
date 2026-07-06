# Orders Module 10 — Backend Contract Audit

## Endpoint

```
GET /analytics/orders
```

Controller: `Backend/src/analytics/analytics.controller.ts` — Line 56
Service:    `Backend/src/analytics/analytics.service.ts`    — Line 189
Query DTO:  `Backend/src/analytics/dto/analytics-query.dto.ts`

---

## 1. Date Range Filtering

### DTO (`analytics-query.dto.ts`)

```ts
export class AnalyticsQueryDto {
  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;
}
```

### Service application (`analytics.service.ts` lines 204–209)

```ts
if (query.startDate) {
  qb.andWhere('order.created_at >= :startDate', { startDate: query.startDate });
}
if (query.endDate) {
  qb.andWhere('order.created_at <= :endDate', { endDate: query.endDate });
}
```

**Verdict:** PASS
- `startDate` and `endDate` are both optional ISO date string query params.
- Applied dynamically via TypeORM QueryBuilder `andWhere`.
- NOT hardcoded to `today` or `thisMonth`. Full date range support confirmed.

---

## 2. Summary Metrics

### Source (`analytics.service.ts` lines 212–217, 262–267)

```ts
totalsQb
  .select('COUNT(order.id)', 'total_orders')
  .addSelect('SUM(order.total_amount)', 'total_revenue')
  .addSelect('AVG(order.total_amount)', 'average_order_value');
```

### Returned shape

```ts
totals: {
  totalOrders: number,
  totalRevenue: number,
  averageOrderValue: string  // toFixed(2)
}
```

**Delivered / Cancelled counts** are NOT in `totals` — they are in `statusDistribution` as individual status counts.
Frontend must derive `totalDelivered` and `totalCancelled` by filtering `statusDistribution` where `status === 'DELIVERED'`
and `status === 'CANCELLED'` respectively.

**Verdict:** PASS — all required fields present or derivable from payload.

---

## 3. Status Distribution

### Source (`analytics.service.ts` lines 219–225, 268–271)

```ts
statusQb
  .select('order.status', 'status')
  .addSelect('COUNT(order.id)', 'count')
  .groupBy('order.status');
```

### Returned shape

```ts
statusDistribution: Array<{
  status: string;   // 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' | ...
  count: number;
}>
```

**Verdict:** PASS — backend returns all statuses that exist in the date range. Frontend renders all that exist.

---

## 4. Revenue Trends

### Source (`analytics.service.ts` lines 227–235, 272–276)

```ts
trendsQb
  .select('DATE(order.created_at)', 'date')
  .addSelect('COUNT(order.id)', 'order_count')
  .addSelect('SUM(order.total_amount)', 'revenue')
  .groupBy('DATE(order.created_at)')
  .orderBy('date', 'ASC');
```

### Returned shape

```ts
trends: Array<{
  date: string;       // 'YYYY-MM-DD'
  orderCount: number;
  revenue: number;
}>
```

**Verdict:** PASS — time-series daily data with `date`, `orderCount`, `revenue`. Matches requirement exactly.

---

## 5. Salesman Leaderboard

### Source (`analytics.service.ts` lines 237–248, 277–280)

```ts
salesmanQb
  .leftJoin('order.salesman', 'salesman')
  .leftJoin('salesman.user', 'user')
  .select('user.full_name', 'salesman_name')   // ← human-readable name
  .addSelect('COUNT(order.id)', 'order_count')
  .addSelect('SUM(order.total_amount)', 'revenue')
  .groupBy('user.id')
  .orderBy('revenue', 'DESC')
  .limit(5);
```

### Returned shape

```ts
topSalesmen: Array<{
  name: string;       // user.full_name — NOT salesman_id
  orderCount: number;
  revenue: number;
}>
```

**Human Readability Verdict:** PASS
- `user.full_name` is selected and aliased as `salesman_name` in the query.
- Returned as `name` in the mapped response object.
- `salesman_id` is NOT returned or exposed.

---

## 6. Distributor Leaderboard

### Source (`analytics.service.ts` lines 250–260, 282–285)

```ts
distQb
  .leftJoin('order.distributor', 'distributor')
  .select('distributor.business_name', 'distributor_name')   // ← human-readable name
  .addSelect('COUNT(order.id)', 'order_count')
  .addSelect('SUM(order.total_amount)', 'revenue')
  .groupBy('distributor.id')
  .orderBy('revenue', 'DESC')
  .limit(5);
```

### Returned shape

```ts
topDistributors: Array<{
  name: string;       // distributor.business_name — NOT distributor_id
  orderCount: number;
  revenue: number;
}>
```

**Human Readability Verdict:** PASS
- `distributor.business_name` is selected and aliased as `distributor_name`.
- Returned as `name` in the mapped response object.
- `distributor_id` is NOT returned or exposed.

---

## 7. Full Response Shape

```ts
// GET /analytics/orders?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

{
  totals: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: string;   // toFixed(2)
  };
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  trends: Array<{
    date: string;
    orderCount: number;
    revenue: number;
  }>;
  topSalesmen: Array<{
    name: string;        // user.full_name
    orderCount: number;
    revenue: number;
  }>;
  topDistributors: Array<{
    name: string;        // distributor.business_name
    orderCount: number;
    revenue: number;
  }>;
}
```

---

## 8. RBAC Verification

Controller decorator (`analytics.controller.ts` line 57):

```ts
@Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
```

Backend allows SALESMAN access to this endpoint. However, the Module 10 spec requires the Analytics page
to be hidden from SALESMAN on the frontend. `isAdminRole()` from `@/lib/auth/rbac` already covers
`SUPER_ADMIN | MANUFACTURER_ADMIN | DISTRIBUTOR_ADMIN` — this will be used to gate the page.

**RBAC Verdict:** PASS
- Frontend gating via `RoleGuard` / `isAdminRole()` is sufficient.
- No additional backend work required.

---

## 9. Pagination Governance

Both `topSalesmen` and `topDistributors` are server-side `LIMIT 5` arrays.
Backend does NOT paginate leaderboards. No frontend pagination required for leaderboards.

**Verdict:** No pagination needed. Top 5 arrays. Document only.

---

## 10. Existing Frontend Service

`analyticsService.getOrders()` exists in `admin-panel/src/services/analytics.service.ts` line 9:

```ts
getOrders: () => api.get<ApiResponse<OrdersResponse>>('/analytics/orders').then(res => res.data),
```

**Gap identified:** This call does NOT pass `startDate`/`endDate` query params. The existing `OrdersResponse`
type is also outdated (only has `total: number`).

**Required changes:**
1. Update `analyticsService.getOrders()` to accept and forward `AnalyticsQueryParams`.
2. Add `OrdersAnalyticsDto` type to `analytics.types.ts`.
3. Update `analyticsKeys.orders()` to accept params for proper cache separation.

---

## 11. Blockers

**NONE.** Backend contract fully passes all requirements:

| Requirement | Status |
|---|---|
| `GET /analytics/orders` exists | ✅ |
| `startDate` / `endDate` query params | ✅ |
| Not hardcoded to today/thisMonth | ✅ |
| `totalOrders`, `totalRevenue`, `averageOrderValue` | ✅ |
| `totalDelivered`, `totalCancelled` | ✅ (via statusDistribution) |
| Status distribution array | ✅ |
| Revenue trend time-series | ✅ |
| `salesman.full_name` (as `name`) | ✅ |
| `distributor.business_name` (as `name`) | ✅ |
| No raw IDs in salesman/distributor leaderboard | ✅ |
| RBAC guard applicable | ✅ |

**Audit verdict: PROCEED TO IMPLEMENTATION**
