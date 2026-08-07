export interface RegisterSalesmanDto {
  email: string;
  password?: string;
  full_name: string;
  distributor_id: string;
  phone?: string;
}
export interface UpdateSalesmanDto {
  full_name?: string;
  email?: string;
  phone?: string;
  state?: string;
  state_id?: string;
  city?: string | null;
  city_id?: string | null;
  is_active?: boolean;
}

export interface UpdateSalesmanStatusDto {
  is_active: boolean;
}

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
  state_id: string | null;
  state_name: string | null;
  city_id: string | null;
  city_name: string | null;
}
