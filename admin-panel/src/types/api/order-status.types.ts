export interface OrderStatusDto {
  id: string;
  name: string;
  sequence: number;
  can_cancel_order: boolean;
  isactive: boolean;
  is_cancel_status: boolean;
  is_dispatch_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderStatusDto {
  name: string;
  sequence: number;
  can_cancel_order: boolean;
  isactive: boolean;
  is_cancel_status: boolean;
  is_dispatch_status: boolean;
}

export type UpdateOrderStatusDto = Partial<CreateOrderStatusDto>;
