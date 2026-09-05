export interface CreateManufacturerDto {
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface CreateManufacturerAdminDto extends CreateManufacturerDto {
  password?: string;
  is_active?: boolean;
}

export interface UpdateManufacturerDto {
  company_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  is_active?: boolean;
}

export interface ManufacturerDto {
  id: string;
  user_id: string;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
