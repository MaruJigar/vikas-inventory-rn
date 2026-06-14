export interface CreateManufacturerDto {
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
