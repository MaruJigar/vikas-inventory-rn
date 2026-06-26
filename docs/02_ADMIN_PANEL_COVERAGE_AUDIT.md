# 02_ADMIN_PANEL_COVERAGE_AUDIT.md

## SECTION 1: Executive Coverage Summary

*   **Total Backend Modules**: 39
*   **Fully Covered**: 6 (Auth, User, Manufacturer, Product, Salesman, Shop)
*   **Partially Covered**: 8 (Approvals, Analytics, Backorders, Distributors, Fulfillment, Inventory, Orders, Visits) - Feature code exists but Routes are missing.
*   **Not Covered**: 25 (Location, Billing, Audit-Logs, Offline-Sync, Role-Permission, Notifications, etc.)
*   **Broken**: 0 (Recent build issues resolved)
*   **Coverage Percentage**: ~15% Full, ~20% Partial

## SECTION 2: Module Coverage Matrix

### Order Management
*   **Coverage**: 10%
*   **Implemented**: None (Feature hooks exist, but no `app/(dashboard)/orders` route).
*   **Missing**: Order Listing, Order Details, Status Updates, Backorder Processing.
*   **Priority**: CRITICAL

### Location Tracking
*   **Coverage**: 0%
*   **Implemented**: None.
*   **Missing**: Live Map, Path History, GPS Logs.
*   **Priority**: HIGH

### Shop Visit Management
*   **Coverage**: 10%
*   **Implemented**: None (Feature code exists, route missing).
*   **Missing**: Attendance Dashboard, Check-in/Check-out reconciliation.
*   **Priority**: HIGH

## SECTION 3: Screen Coverage Audit

### Approvals Page (`/approvals`)
*   **Completion**: 80%
*   **Implemented Features**: Pending queue, Approve/Reject dialogs.
*   **Missing Features**: Bulk actions, detailed history.

### Salesmen Page (`/salesmen`)
*   **Completion**: 95%
*   **Implemented Features**: Grid, Search, Create/Edit drawers, Suspense boundaries.
*   **Missing Features**: Real-time location mini-map.

## SECTION 4: API Coverage Audit

*   `GET /orders`: **NO UI**. Missing Order Dashboard.
*   `GET /location/latest`: **NO UI**. Missing Map Tracking.
*   `GET /inventory/movements`: **NO UI**. Missing Stock Movement Ledger.
*   `GET /audit-logs`: **NO UI**. Missing Security Panel.

## SECTION 5: Permission Coverage Audit

*   **Backend Permission**: Global Role Validation via `@Roles()`.
*   **UI Enforcement**: `<RoleGuard>` wrapper implemented.
*   **Missing Enforcement**: Component-level granular permission checks (e.g., hiding specific buttons if user is Distributor vs Manufacturer).

## SECTION 6: Dashboard Coverage Audit

*   **Backend Metrics**: Analytics Snapshot API exists.
*   **Dashboard Widgets**: Currently hardcoded or basic. Missing deep integration with live analytics endpoints.

## SECTION 7: Reporting Coverage Audit

*   **Backend Reports**: Export logic and aggregated data available.
*   **Admin Reports**: 0% Implementation. No CSV/PDF exports built in UI.

## SECTION 8: Realtime Coverage Audit

*   **Backend Socket Events**: Emits `order.updated`, `notification.received`.
*   **Admin Socket Usage**: 0% Implementation. No `socket.io-client` hook integration in UI.

## SECTION 9: Upload Coverage Audit

*   **Backend Upload**: Multipart form data support exists.
*   **Admin Upload Features**: Implemented for Shop Creation (Image upload). Missing for bulk product CSV imports.

## SECTION 10: Missing Features Master List

| Feature | Backend Exists? | Admin Exists? | Priority | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Order Dashboard** | YES | NO | CRITICAL | HIGH |
| **Live Salesman Map** | YES | NO | HIGH | HIGH |
| **Inventory Ledger** | YES | NO | HIGH | MEDIUM |
| **Audit Log Viewer** | YES | NO | LOW | LOW |
| **Notification Center** | YES | NO | MEDIUM | MEDIUM |
| **Offline Sync Conflicts** | YES | NO | HIGH | HIGH |

## SECTION 11: Admin Completion Scorecard

*   **Authentication**: 100%
*   **Manufacturers**: 100%
*   **Salesmen**: 95%
*   **Products**: 90%
*   **Shops**: 90%
*   **Approvals**: 80%
*   **Orders**: 0% (CRITICAL GAP)
*   **Visits**: 0% (CRITICAL GAP)
*   **Inventory**: 0% (CRITICAL GAP)
*   **Realtime**: 0%
*   **Overall Admin Coverage: ~20%**

## SECTION 12: Implementation Roadmap

### Phase 1: Critical Missing Features
1.  **Order Management**: Create `/orders` route utilizing existing `@/features/orders` hooks.
2.  **Visit Tracking**: Create `/visits` route for daily salesman attendance.
3.  **Inventory Control**: Create `/inventory` route for distributor stock allocation.

### Phase 2: High Value Features
1.  **Live Location Map**: Integrate Google Maps or Mapbox with `/location` endpoints.
2.  **Realtime WebSockets**: Integrate `socket.io-client` for live notifications.

### Phase 3: Nice To Have Features
1.  **Audit Logs UI**.
2.  **Advanced PDF Reporting**.
