import { ProductDto } from './product.types';

export interface InventoryDto {
  id: string;
  distributor_id?: string;
  manufacturer_id?: string;
  product_id: string;
  available_quantity: number;
  reserved_quantity: number;
  backordered_quantity: number;
  created_at: string;
  updated_at: string;
  product?: ProductDto;
}

export type MovementType =
  | 'OPENING_STOCK'
  | 'STOCK_ADDED'
  | 'STOCK_REMOVED'
  | 'STOCK_CORRECTED'
  | 'MANUAL_ADJUSTMENT';

export interface AdjustInventoryDto {
  distributor_id?: string;
  manufacturer_id?: string;
  product_id: string;
  movement_type: MovementType;
  quantity_change: number;
  reason?: string;
}

export interface InventoryMovementDto {
  id: string;
  distributor_id?: string;
  manufacturer_id?: string;
  product_id: string;
  movement_type: MovementType;
  quantity_change: number;
  previous_available_quantity: number;
  new_available_quantity: number;
  previous_reserved_quantity: number;
  new_reserved_quantity: number;
  previous_backordered_quantity: number;
  new_backordered_quantity: number;
  reason?: string;
  changed_by_user_id?: string;
  created_at: string;
}
