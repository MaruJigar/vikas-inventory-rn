# Orders Module 8 — Backend Fulfillment Requirements

## Overview
The frontend requires a new endpoint to fetch fulfillment logs for an order to render the Fulfillment History Drawer. 

## Required Endpoint
- **Method:** `GET`
- **Path:** `/orders/:id/fulfillment-logs`

## Contract Requirements
1. **Paginated:** Must accept standard `page` and `limit` queries and return a standard `PaginatedResponse<FulfillmentLogDto>`.
2. **Human-readable:** The query (via TypeORM `findAndCount`) MUST include the `relations: ['performed_by_user', 'distributor', 'order_item']` so that human-readable names can be rendered on the frontend.
3. **No UUID Exposure:** The UI strictly forbids displaying UUIDs to the user. The backend must provide resolved string fields (e.g., `performed_by_user.full_name`) to fulfill the UI contract.
4. **Ordering:** Results should typically be ordered by `created_at` DESC (latest events first) or ASC (chronological progression) depending on the standard timeline view. (Suggest `ASC` to match Status History).

**Status: BLOCKED.** Frontend implementation cannot proceed until this endpoint is available.
