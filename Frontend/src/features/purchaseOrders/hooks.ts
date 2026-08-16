import { useMemo } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { purchaseOrdersApi } from '@/features/purchaseOrders/api';
import type { POProduct } from '@/features/purchaseOrders/types';
import type { CreatePurchaseOrderPayload } from '@/features/purchaseOrders/types';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

/** How long quantity edits settle before the cart re-prices server-side. */
const PREVIEW_DEBOUNCE_MS = 400;

/**
 * Server-priced PO cart preview. The distributor discount lives on the
 * distributor record, so the total can only come from the backend — this is a
 * POST that behaves like a query.
 *
 * Debounced so holding a stepper doesn't fire a request per tap, and the
 * previous total stays on screen while the next one loads instead of blanking.
 */
export function usePurchaseOrderPreview(products: POProduct[]) {
  // Debounce a serialized signature, not the array: callers rebuild the array
  // every render, and a fresh identity each time would restart the timer
  // forever so the debounce never fired.
  const signature = JSON.stringify(products);
  const debounced = useDebouncedValue(signature, PREVIEW_DEBOUNCE_MS);
  const payload = useMemo(
    () => JSON.parse(debounced) as POProduct[],
    [debounced],
  );

  return useQuery({
    queryKey: ['purchase-order-preview', debounced],
    queryFn: () => purchaseOrdersApi.preview({ products: payload }),
    // The endpoint 400s on an empty payload, and an empty cart has no total.
    enabled: payload.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Submit the PO cart. Creates DRAFT orders, so invalidate the orders list +
 * dashboard so the new purchase orders show up. */
export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) =>
      purchaseOrdersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

