# Orders Module 7 — Backend Export Requirements

## Overview
A backend audit was performed across the `Backend/src` directory for export functionalities (CSV, XLSX, PDF, Excel). No existing export APIs, DTOs, or generation services were found for the Order module.

To unblock Module 7 (Exports), the backend must implement the following endpoints and business logic.

## Required Endpoints
The following REST endpoints must be exposed under the `OrdersController`:

- `GET /orders/export/csv`
- `GET /orders/export/xlsx`

## Supported Query Parameters (Filters)
Both endpoints must support the standard `OrderListQueryDto` parameters:
- `page`
- `limit`
- `search`
- `status`
- `salesman_id`
- `shop_id`
- `startDate` (ISO 8601 string)
- `endDate` (ISO 8601 string)

## Required RBAC
The endpoints must enforce strictly scoped Role-Based Access Control via guards. 
**Allowed Roles:**
- `SUPER_ADMIN`
- `DISTRIBUTOR_ADMIN`
- `MANUFACTURER_ADMIN`

**Restricted Roles:**
- `SALESMAN` (Explicitly blocked from accessing bulk exports).

## Human Readability & Data Mapping
The exported file (CSV/XLSX) must contain human-readable text. It MUST NOT export raw UUIDs or technical identifiers.
The required columns mapped from the `Order` entity are:
- `Order Number`
- `Shop Name` (via `shop` relation)
- `Salesman Name` (via `salesman` relation)
- `Distributor Name` (via `distributor` relation)
- `Status`
- `Final Amount` (`final_order_amount`)
- `Created Date` (`created_at` formatted gracefully)
