import { useMutation, useQueryClient } from '@tanstack/react-query';

import { purchaseOrdersApi } from '@/features/purchaseOrders/api';
import type { CreatePurchaseOrderPayload } from '@/features/purchaseOrders/types';

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

