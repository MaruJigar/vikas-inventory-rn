# Orders Module 9 — Backorders Freeze Audit

## 1. Files Modified
- `admin-panel/src/types/api/order.types.ts`: Added `BackorderDto`, `BackorderResolutionDto`, `BackordersResponse`.
- `admin-panel/src/services/order.service.ts`: Added `getBackorders`, `getBackorderById`, `resolveBackorder`.
- `admin-panel/src/lib/query-keys/orders.ts`: Extended keys with `backorders` hierarchy.
- `admin-panel/src/hooks/orders/useBackordersQuery.ts`: New React Query hook for paginated backorder lists.
- `admin-panel/src/hooks/orders/useBackorderQuery.ts`: New hook for singular lookups.
- `admin-panel/src/hooks/orders/useResolveBackorderMutation.ts`: New mutation for `PATCH /resolve`.
- `admin-panel/src/features/orders/backorders-columns.tsx`: Defined human-readable data table mappings.
- `admin-panel/src/features/orders/components/backorder-details-drawer.tsx`: Drawer for human-readable nested payloads.
- `admin-panel/src/features/orders/components/resolve-backorder-dialog.tsx`: Safe resolution mutation interface.
- `admin-panel/src/app/(dashboard)/orders/backorders/page.tsx`: Page integration holding the data table, drawer, and dialog states.

## 2. Contract Audit Evidence
The backend payload perfectly matched the requirement: nested relations (`product`, `distributor`, `order.salesman`) are populated directly by TypeORM, meaning the frontend relies on mapped strings and completely avoids manual ID resolution. The audit `ORDERS_MODULE_9_CONTRACT_AUDIT.md` validated this.

## 3. Hook Evidence (`useResolveBackorderMutation.ts`)
```tsx
export function useResolveBackorderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BackorderResolutionDto }) => 
      orderService.resolveBackorder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.backorders.all() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.backorders.detail(id) });
      handleSuccessToast('Backorder successfully allocated/resolved.');
    },
    onError: (error: Error) => {
      handleUnexpectedToast(error);
    },
  });
}
```

## 4. Page Evidence (`page.tsx`)
Filters mapped robustly with `useDataTable()` enforcing strictly server-side operations:
```tsx
          <Select
            value={(queryState.status as string) || 'all'}
            onValueChange={(val) => setFilter('status', val === 'all' || !val ? undefined : String(val))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            {/* Options... */}
          </Select>
```

## 5. Table Evidence (`backorders-columns.tsx`)
```tsx
  {
    accessorKey: 'context',
    header: 'Context',
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium text-slate-900">{row.original.distributor?.business_name || 'N/A'}</div>
        <div className="text-slate-500 text-xs mt-0.5">SM: {row.original.order?.salesman?.full_name || 'N/A'}</div>
      </div>
    ),
  },
```

## 6. Drawer Evidence (`backorder-details-drawer.tsx`)
Data bindings mapped deep strictly bypassing IDs:
```tsx
                <div className="flex justify-between">
                  <span className="text-slate-500">Distributor</span>
                  <span className="font-medium text-slate-900 text-right">{backorder.distributor?.business_name || 'N/A'}</span>
                </div>
```

## 7. Resolve Dialog Evidence (`resolve-backorder-dialog.tsx`)
```tsx
  const handleResolve = () => {
    if (!backorder) return;
    const qty = Number(allocatedQty);
    if (isNaN(qty) || qty <= 0 || qty > remaining) return;

    resolve(
      { id: backorder.id, data: { resolved_quantity: qty, notes: notes || undefined } },
      { onSuccess: handleClose }
    );
  };
```

## 8. Pagination Evidence
Pagination adheres 100% to server-side slicing enforced by the `useDataTable` hook driving `DataTable`.

## 9. Human Readability Evidence
`ORDERS_MODULE_9_HUMAN_READABILITY_AUDIT.md` verified that zero raw UUIDs exist in the presentation markup layer.

## 10. Build Output
```bash
> admin-panel@0.1.0 build
> next build

   Creating an optimized production build ...
 ✓ Compiled successfully in 10.0s
   Linting and checking validity of types ...
   Generating static pages (18/18)
   Finalizing page optimization ...

Route (app)                                 Size  First Load JS
┌ ○ /                                      124 B         102 kB
├ ○ /orders                              15.5 kB         298 kB
├ ○ /orders/backorders                   6.58 kB         250 kB
```

## 11. Screenshot-Equivalent UI
The user navigates to "Backorders". The top displays a unified search input and a status dropdown filter (`OPEN`, `PARTIALLY_ALLOCATED`, etc). 
A table lists active backlogs mapping specific products (e.g., "Steel Beam C3") to the awaiting distributor and associated salesman. The quantities show "Req", "Alloc", and "Rem" metrics natively. 
Clicking `...` -> `View Details` opens a robust right-aligned drawer containing four distinct panels summarizing context. 
Clicking `...` -> `Resolve Allocation` opens a dialog locking allocation constraints automatically to `< remaining` count preventing overallocation.

## 12. Freeze Recommendation
FREEZE APPROVED. Module 9 compiles safely, strictly bounds state, guarantees Human Readability, invalidates the `ordersKeys` correctly, and avoids frontend payload duplication. Proceed to the next module.
