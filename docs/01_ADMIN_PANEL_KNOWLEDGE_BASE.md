# 01_ADMIN_PANEL_KNOWLEDGE_BASE.md

## SECTION 1: Executive Summary

The Vikas Inventory Admin Panel provides management and oversight capabilities for the entire field sales and inventory platform.
*   **Product Purpose**: Centralize the administration of manufacturers, distributors, products, salesmen, and shops. Monitor live orders, visits, and approvals.
*   **User Roles**: Super Admin, Manufacturer Admin, Distributor Admin.
*   **Responsibilities**: Approving new salesmen, flagging duplicate shops, managing inventory catalogs, tracking sales performance, and resolving order fulfillment issues.

## SECTION 2: Complete Admin Architecture

*   **Next.js Architecture**: App Router (`app/`), Server Components where appropriate, Client Components (`"use client"`) for interactivity (data tables, forms, hooks).
*   **Page Architecture**: Layouts with Next.js App Router (`(dashboard)` route group).
*   **Data Flow**: TanStack React Query for data fetching, caching, and state management.
*   **API Integration Flow**: Axios instances with JWT interceptors. Custom React hooks (`use*Query`, `use*Mutation`) abstracting API calls.
*   **Authentication Flow**: Standard JWT Bearer token stored in secure context. Protected by `RoleGuard` wrapper components.

## SECTION 3: Role & Permission Matrix

| Role | Allowed Pages | Restricted Actions | Required UI Controls |
| :--- | :--- | :--- | :--- |
| **Super Admin** | All Pages | None | Global Settings, User Role Assignment, Full Override |
| **Manufacturer** | Products, Inventory, Orders (Read) | Create/Edit Salesmen, Approve Shops | Manufacturer-scoped Filters |
| **Distributor** | Salesmen, Orders, Fulfillment, Inventory | Create Manufacturers/Products | Accept/Reject Orders, Assign Salesmen |

## SECTION 4: Complete Admin Screen Inventory

*   **Dashboard** (Implemented): Overview metrics, KPIs.
*   **Manufacturers** (Implemented): Grid of manufacturers. CRUD, search, pagination.
*   **Products** (Implemented): Grid of products. Pricing, category filters.
*   **Salesmen** (Implemented): Management of field agents. Registration approvals, tracking.
*   **Shops** (Implemented): Map/List of all retail shops. Duplicate detection UI.
*   **Approvals** (Implemented): Centralized queue for pending approvals (shops, salesmen).
*   **Orders** (Missing Route): Order lifecycle tracking, status updates.
*   **Visits** (Missing Route): Daily attendance, GPS tracking logs.
*   **Distributors** (Missing Route): Management of distributor entities.
*   **Notifications** (Missing Route): System-wide broadcast mechanism.
*   **Inventory** (Missing Route): Stock levels, movement logs.
*   **Audit Logs** (Missing Route): Security audit trails.

## SECTION 5: Backend Feature Mapping

*   **Location Module**: Requires live map dashboard of salesman positions.
*   **Order Module**: Requires order fulfillment tracking, backorder management.
*   **Offline-Sync Module**: Requires sync conflict resolution UI for admins.
*   **Billing Module**: Requires invoice generation and payment tracking UI.

## SECTION 6: Dashboard Specification

*   **Live Sales Feed**: Data Source: WebSocket `order.updated`.
*   **Active Field Agents**: Data Source: `location` and `visit` APIs. Realtime map overlay.
*   **Pending Approvals**: Widget summarizing the `approvals` queue.

## SECTION 7: Reporting Specification

*   **Sales Performance Report**: Grouped by Salesman, Region, Product. Export to CSV/PDF.
*   **Attendance & Visit Report**: Delta of check-in/out times. Distance traveled.
*   **Inventory Depletion Report**: Products nearing zero stock.

## SECTION 8: Realtime Requirements

*   **Socket Events**: Listen for `notification.received`, `order.updated`.
*   **UI Updates**: Toast notifications, badge counts on sidebar navigation.

## SECTION 9: Upload & Media Requirements

*   **Shop Images**: Image viewer component for verification.
*   **Product Catalogs**: Bulk CSV imports.

## SECTION 10: AI Admin Development Context

When implementing missing features:
1.  Always use `useDataTable` hook for grid state.
2.  Wrap data-fetching page content in `<Suspense>` boundaries.
3.  Enforce `<RoleGuard>` on all new page exports.
