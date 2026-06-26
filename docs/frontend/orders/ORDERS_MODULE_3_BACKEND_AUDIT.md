# Orders Module 3 — Backend Contract Audit

## Endpoint: `PATCH /orders/:id`

### 1. Payload Shape
The endpoint expects `UpdateOrderDto` wrapped in the standard `PATCH` request.
```typescript
interface UpdateOrderDto {
  products: {
    productId: string;
    quantity: number;
    itemDiscountType?: 'NONE' | 'PERCENTAGE' | 'FLAT';
    itemDiscountValue?: number;
  }[];
  billDiscountType?: 'NONE' | 'PERCENTAGE' | 'FLAT';
  billDiscountValue?: number;
  reason?: string;
}
```

### 2. Item Structure
The API expects the raw `productId` for the update mutation (unlike the read endpoint which hides it). The frontend will need to pass `product.id` back to the server, meaning the `OrderDto` from `GET /orders/:id` must include `product_id` within the `items` array to allow updates. **Observation:** Our current `OrderItemDto` in the frontend does not have `product_id`. We need to add `product_id` to `OrderItemDto` to map it properly.

### 3. Revision Behavior
The service deletes all existing `OrderItem` entries and recreates them. It creates an `OrderRevision` record mapping the exact old state to the exact new state.

### 4. Inventory Reallocation
If the order is edited *before* dispatch, the previous inventory reservations are released, and new ones are calculated. If edited *after* dispatch, inventory remains untouched (though the frontend will block post-dispatch edits anyway).

### 5. Validation Errors
- **404:** Product not found, Order not found.
- **403:** Not your order (Ownership check), Only salesmen can perform this action.
- **400:** Cannot edit a cancelled or delivered order.

### 6. Ownership Rules
Only the `SALESMAN` who originally created the order can edit it. The frontend rule `role === SALESMAN` correctly aligns with this backend requirement.

---
**Status:** Verification complete. No mismatch found. We need to add `product_id` to `OrderItemDto` in the frontend to fulfill the update payload.
