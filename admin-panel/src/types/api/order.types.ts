export interface OrderProductDto {
  productId: string;
  quantity: number;
  itemDiscountType?: 'NONE' | 'PERCENTAGE' | 'FLAT';
  itemDiscountValue?: number;
}

import { PaginatedResponse } from '@/types/api/common.types';

export interface CreateOrderDto {
  visitId: string;
  shopId: string;
  products: OrderProductDto[];
  billDiscountType?: 'NONE' | 'PERCENTAGE' | 'FLAT';
  billDiscountValue?: number;
  isOfflineCreated?: boolean;
  idempotencyKey?: string;
}

export interface UpdateOrderDto {
  products: OrderProductDto[];
  billDiscountType?: 'NONE' | 'PERCENTAGE' | 'FLAT';
  billDiscountValue?: number;
  reason?: string;
}

export interface CancelOrderDto {
  cancellationReason: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  notes?: string;
}

export interface OrderDto {
  id: string;
  order_number: string;
  shop_id: string;
  distributor_id: string;
  salesman_id: string;
  status: string;
  total_amount: number;
  gross_order_amount: number;
  total_product_discount_amount: number;
  bill_discount_amount: number;
  final_order_amount: number;
  total_quantity: number;
  created_at: string;
  shop?: {
    id: string;
    name: string;
    owner_name?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  salesman?: {
    id: string;
    full_name: string;
  };
  distributor?: {
    id: string;
    business_name: string;
  };
  items?: OrderItemDto[];
  cancellation_reason?: string;
}

export interface OrderItemDto {
  id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  quantity: number;
  mrp_snapshot: number;
  discount_amount: number;
  line_total: number;
  status: string;
}

export interface OrderRevisionDto {
  id: string;
  order_id: string;
  revision_number: number;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  changed_fields?: Record<string, unknown>;
  changed_by_user_id: string;
  changed_by_role: string;
  order_status_at_time: string;
  inventory_impact?: Record<string, unknown>;
  distributor_notified: boolean;
  reason?: string;
  created_at: string;
  changed_by_user?: {
    id: string;
    full_name: string;
  };
}

export interface OrderStatusHistoryDto {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: string;
  changed_by_user_id?: string;
  reason?: string;
  created_at: string;
  changed_by_user?: {
    id: string;
    full_name: string;
  };
}

export interface FulfillmentLogDto {
  id: string;
  action: string;
  quantity?: number | null;
  old_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  created_at: string;
  performed_by_user?: {
    id: string;
    full_name: string;
  } | null;
  distributor?: {
    id: string;
    business_name: string;
  } | null;
}

export type FulfillmentLogsResponse = PaginatedResponse<FulfillmentLogDto>;

export interface BackorderDto {
  id: string;
  quantity: number;
  resolved_quantity: number;
  status: string;
  created_at: string;
  resolved_at?: string | null;
  product?: {
    id: string;
    name: string;
    sku: string;
  } | null;
  distributor?: {
    id: string;
    business_name: string;
  } | null;
  order?: {
    id: string;
    order_number: string;
    salesman?: {
      id: string;
      full_name: string;
    } | null;
  } | null;
}

export interface BackorderResolutionDto {
  resolved_quantity: number;
  notes?: string;
}

export type BackordersResponse = PaginatedResponse<BackorderDto>;
