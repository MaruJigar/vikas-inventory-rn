# Orders Module 2 — Details Drawer Specification

## Overview
Module 2 introduces the strictly read-only Order Details Drawer, accessible via the "View Details" action on the Orders List Page.

## API Integration
**Endpoint Used:** `GET /orders/:id`
**Description:** Fetches a complete order tree explicitly resolving relationships to prevent the frontend from displaying system IDs.

## Data Sections Displayed

### 1. Order Summary
* Order Number
* Status (Rendered via custom Badge element)
* Created Date (Localized format)
* Total Quantity
* Cancellation Reason (Shown conditionally if present)

### 2. Shop Information
* Shop Name
* Owner Name
* Phone
* Location (City, State)

### 3. Sales Team
* Salesman Name (Full Name)
* Distributor Name (Business Name)

### 4. Order Items
* A data table enumerating `order.items`.
* Displays `product_name_snapshot` instead of generic relations or product IDs.
* Displays `sku_snapshot`.
* Displays itemized quantities, MRP, item-level discounts, and the computed line total.

### 5. Financial Summary
* Gross Amount
* Product Discount Amount
* Bill Discount Amount
* Final Amount

## Human Readability Proof
The application has been explicitly restricted from rendering backend system identifiers.
**Implementation Rule:**
```tsx
// Inside OrderDetailsDrawer.tsx
{order.shop?.name || 'N/A'} // INSTEAD of order.shop_id
{item.product_name_snapshot} // INSTEAD of item.product_id
{order.salesman?.full_name} // INSTEAD of order.salesman_id
```
At no point do raw UUIDs appear on the screen.

## State Management
* **Loading State:** Managed via standard Shadcn UI Skeletons mapping the dimensions of the layout sections to prevent layout shift.
* **Error State:** Fallback error boundary rendered inline with a user-friendly message.
* **Empty State:** Conditionally renders "No order items found" if the items payload array is null or `length === 0`.

## Known Limitations
* **Strictly Read-Only:** There are no action buttons inside the drawer. Status transitions, cancellations, and order editing are deferred to subsequent modules.
* **Payment Status:** If payment tracking is introduced later to the `OrderDto`, the layout must be manually expanded in Section 1 to accommodate it.
