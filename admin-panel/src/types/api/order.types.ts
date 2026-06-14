export interface OrderProductDto {
  productId: string;
  quantity: number;
  itemDiscountType?: 'NONE' | 'PERCENTAGE' | 'FLAT';
  itemDiscountValue?: number;
}

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

export interface OrderDto {
  id: string;
  shop_id: string;
  distributor_id: string;
  salesman_id: string;
  status: string;
  total_amount: number;
}
