export interface RegisterSalesmanDto {
  email: string;
  password?: string;
  name: string;
  distributor_id: string;
  phone?: string;
}
export type UpdateSalesmanDto = Partial<RegisterSalesmanDto>;

export interface SalesmanDto {
  id: string;
  user_id: string;
  name: string;
}
