export interface CreateDistributorAdminDto {
  business_name: string;
  owner_name?: string;
  phone: string;
  email: string;
  password?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  is_active?: boolean;
  is_internal_distributor?: boolean;
  manufacturer_ids: string[];
}

export interface UpdateDistributorAdminDto {
  business_name?: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  is_active?: boolean;
  is_internal_distributor?: boolean;
  manufacturer_ids?: string[];
}

export interface DistributorDto {
  id: string;
  user_id: string;
  business_name: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  approval_status: string;
  is_active: boolean;
  is_internal_distributor?: boolean;
  created_at: string;
  updated_at: string;
  manufacturer_ids?: string[];
}
