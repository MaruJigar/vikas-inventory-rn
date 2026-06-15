export type MovementType = 'OPENING_STOCK' | 'STOCK_ADDED' | 'STOCK_REMOVED' | 'STOCK_CORRECTED' | 'MANUAL_ADJUSTMENT';

export interface AdjustInventoryDto {
  distributor_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity_change: number;
  reason?: string;
}

export interface InventoryDto {
  id: string;
  product_id: string;
  distributor_id: string;
  stock_quantity: number;
}
