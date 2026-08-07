import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  AdjustStockPayload,
  InventoryItem,
  InventoryMovementRecord,
  InventoryValuationRow,
} from '@/types/inventory';

/**
 * Sort fields the backend whitelists on `GET /inventory`. Anything else is
 * silently ignored and it falls back to `updated_at DESC`. Note product NAME is
 * not sortable — the join happens after the order-by is built.
 */
export type InventorySortBy =
  | 'updated_at'
  | 'created_at'
  | 'available_quantity'
  | 'reserved_quantity'
  | 'backordered_quantity';

/**
 * Inventory list query.
 *
 * `search` is intentionally omitted: `ListQueryDto` accepts it but
 * `InventoryService.getInventory` destructures and then never applies it, so
 * sending it would silently return unfiltered results. Text matching is done
 * client-side in the list screen instead.
 */
export interface InventoryListQuery extends Omit<ListQuery, 'search'> {
  sortBy?: InventorySortBy;
}

/** Movement history query — `status` filters by `movement_type` (backend reuses
 * the shared `ListQueryDto.status` field for it). */
export interface MovementListQuery extends Omit<ListQuery, 'search'> {
  status?: string;
}

export const inventoryApi = {
  /** GET /v1/inventory — paginated, auto-scoped to the caller's distributor. */
  list: (query: InventoryListQuery) =>
    apiClient
      .get<Paginated<InventoryItem>>('/inventory', { params: query })
      .then((r) => r.data),

  /**
   * GET /v1/inventory/:id/movements — the ledger for one inventory row. The
   * `type=manufacturer` param exists for manufacturer inventory; distributors
   * always want the default (distributor) side, so it isn't sent.
   */
  movements: (id: string, query: MovementListQuery) =>
    apiClient
      .get<Paginated<InventoryMovementRecord>>(`/inventory/${id}/movements`, {
        params: query,
      })
      .then((r) => r.data),

  /** POST /v1/inventory/adjust — returns the updated inventory row. */
  adjust: (payload: AdjustStockPayload) =>
    apiClient
      .post<InventoryItem>('/inventory/adjust', payload)
      .then((r) => r.data),

  /** GET /v1/analytics/inventory/reports/inventory-valuation — plain array. */
  valuation: () =>
    apiClient
      .get<InventoryValuationRow[]>('/analytics/inventory/reports/inventory-valuation')
      .then((r) => r.data),
};
