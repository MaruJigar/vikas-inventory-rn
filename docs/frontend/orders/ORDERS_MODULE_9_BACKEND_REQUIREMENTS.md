# Orders Module 9 — Backend Requirements

## Overview
A backend audit was performed for the Backorders module. While the `backorder.entity.ts` and internal backorder generation logic exists within `order.service.ts`, the required REST APIs for frontend consumption do not exist.

## Required Endpoints
The following endpoints must be added to the `OrdersController` (or a dedicated `BackordersController`):

### 1. `GET /orders/backorders`
- **Purpose:** Paginated list of all backorders.
- **Parameters:** `page`, `limit`, `search`, `status`, `distributor_id`, `salesman_id`
- **Human Readability:** Must include relations (`product`, `distributor`, `salesman`, `order`) to prevent raw UUID rendering on the frontend.

### 2. `GET /orders/backorders/:id`
- **Purpose:** Fetch details of a specific backorder.
- **Human Readability:** Must join related entities for human-readable display.

### 3. `PATCH /orders/backorders/:id/resolve`
- **Purpose:** Update the status and resolved quantity of a backorder.
- **Payload:** `{ resolved_quantity: number, notes?: string }`

## Status
**BLOCKED.** Frontend implementation cannot proceed until the backend fulfills these API requirements.
