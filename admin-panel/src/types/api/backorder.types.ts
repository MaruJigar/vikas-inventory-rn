export interface BackorderDto {
  id: string;
  order_id: string;
  product_id: string;
  distributor_id: string;
  quantity_backordered: number;
  status: string;
}
