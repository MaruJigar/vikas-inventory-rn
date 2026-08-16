import { apiClient } from '@/api/client';
import type {
  CreatePurchaseOrderPayload,
  CreatePurchaseOrderResult,
  PurchaseOrderPreviewResult,
} from '@/features/purchaseOrders/types';

/** Body the preview accepts — the create DTO, minus the fields that only mean
 * something when an order is actually written. */
export type PreviewPurchaseOrderPayload = Pick<
  CreatePurchaseOrderPayload,
  'products'
>;

/** Distributor→Manufacturer ordering. All routes live under the order
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

  /** Prices the same payload without creating anything — the authoritative
   * cart preview, since the discount lives on the distributor record and the
   * client can't be trusted to know it. */
  preview: (payload: PreviewPurchaseOrderPayload) =>
    apiClient
      .post<PurchaseOrderPreviewResult>(
        '/orders/distributor-to-manufacturer/preview',
        payload,
      )
      .then((r) => r.data),
};
