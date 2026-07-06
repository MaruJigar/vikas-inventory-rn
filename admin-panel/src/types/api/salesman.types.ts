export interface RegisterSalesmanDto {
  email: string;
  password?: string;
  full_name: string;
  distributor_id: string;
  phone?: string;
}
export type UpdateSalesmanDto = Partial<RegisterSalesmanDto>;

export interface SalesmanDto {
  id: string;
  user_id: string;
  distributor_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  approval_status: string;
  approved_by_user_id: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
