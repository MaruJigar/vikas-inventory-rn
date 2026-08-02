import { apiClient } from '@/api/client';
import type {
  CreatePurchaseOrderPayload,
  CreatePurchaseOrderResult,
} from '@/features/purchaseOrders/types';

/** Distributor→Manufacturer ordering. Both routes live under the order
 * controller and are DISTRIBUTOR_ADMIN-only. */
export const purchaseOrdersApi = {
  /** Creates one DRAFT order per manufacturer from a single product payload. */
  create: (payload: CreatePurchaseOrderPayload) =>
    apiClient
      .post<CreatePurchaseOrderResult>(
        '/orders/distributor-to-manufacturer',
        payload,
      )
      .then((r) => r.data),
};
