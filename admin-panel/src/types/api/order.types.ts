export interface OrderProductDto {
  productId: string;
  quantity: number;
}

import { PaginatedResponse } from '@/types/api/common.types';

export interface CreateOrderDto {
  visitId: string;
  shopId: string;
  products: OrderProductDto[];
  isOfflineCreated?: boolean;
  idempotencyKey?: string;
}

export interface UpdateOrderDto {
  products: OrderProductDto[];
  standardDiscountPercent?: number;
  specialDiscountPercent?: number;
  transportMode?: string;
  manufacturerId?: string;
  reason?: string;
}

export interface CancelOrderDto {
  cancellationReason: string;
}

export interface UpdateOrderStatusDto {
  status_id?: string;
  status?: string;
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
  total_gst_amount?: number;
  standard_discount_percent?: number;
  special_discount_percent?: number;
  standard_discount_amount?: number;
  special_discount_amount?: number;
  distributor_discount_percent?: number;
  distributor_discount_amount?: number;
  distributor_margin_percent?: number;
  distributor_margin_amount?: number;
  freight_discount_percent?: number;
  freight_discount_amount?: number;
  cash_discount_percent?: number;
  cash_discount_amount?: number;
  transport_mode?: string;
  manufacturer_id?: string;
  final_order_amount: number;
  total_quantity: number;
  created_at: string;
  shop?: {
    id: string;
    name: string;
    owner_name?: string;
    phone?: string;
    city_name?: string;
    state_name?: string;
    address?: string;
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
  mrp: number;
  gross_line_amount: number;
  net_line_amount: number;
  gst_amount?: number;
  status?: string;
  status_id?: string;
  product?: {
    product_image_url?: string | string[];
  };
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
