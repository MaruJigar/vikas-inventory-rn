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
  manufacturer_id?: string;
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
  created_at: string;
  updated_at: string;
}
