export interface CatalogueDto {
  id: string;
  manufacturer_id: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  download_url: string;
  view_url: string;
  is_available: boolean;
  uploaded_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManufacturerCatalogueItemDto {
  manufacturer_id: string;
  company_name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  is_active: boolean;
  has_catalogue: boolean;
  catalogue?: CatalogueDto | null;
}
