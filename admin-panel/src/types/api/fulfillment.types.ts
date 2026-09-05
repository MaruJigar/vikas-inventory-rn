export interface FulfillOrderDto {
  notes?: string;
}

export interface PartialDispatchItemDto {
  orderItemId: string;
  dispatchQuantity: number;
}

export interface PartialDispatchDto {
  items: PartialDispatchItemDto[];
  notes?: string;
}

export interface PartialDeliverItemDto {
  orderItemId: string;
  deliverQuantity: number;
}

export interface PartialDeliverDto {
  items: PartialDeliverItemDto[];
  notes?: string;
}

export interface FulfillmentDto {
  id: string;
  [key: string]: unknown;
}
