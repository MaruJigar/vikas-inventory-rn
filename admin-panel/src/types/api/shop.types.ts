export interface DuplicateBypassDto {
  matched_shop_id: string;
  match_type: string;
}

export interface CreateShopDto {
  name: string;
  owner_name?: string;
  phone: string;
  address: string;
  city_id?: string;
  state_id?: string;
  city?: string;
  state?: string;
  gst_number?: string;
  maps_link?: string;
  distributor_id?: string;
  verification_photo_url?: string | null;
  duplicate_bypass?: DuplicateBypassDto;
}

export type UpdateShopDto = Partial<CreateShopDto>;

export interface CheckDuplicateDto {
  name: string;
  phone: string;
  city_id?: string;
  state_id?: string;
}

export interface ShopDto {
  id: string;
  distributor_id: string;
  created_by_user_id: string | null;
  created_by_salesman_id: string | null;
  name: string;
  owner_name: string | null;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  city_id: string | null;
  state_id: string | null;
  gst_number: string | null;
  maps_link: string | null;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  verification_photo_url: string | null;
  verification_status: string;
  last_visit_at: string | null;
  last_order_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaginatedShopResponse {
  data: ShopDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ShopUploadResponse {
  id: string;
  uploaded_by_user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  file_type: string | null;
  original_file_name: string | null;
  file_url: string;
  compressed_file_url: string | null;
  mime_type: string | null;
  original_size_bytes: number | null;
  compressed_size_bytes: number | null;
  compression_applied: boolean;
  created_at: string;
  cleanup_after: string | null;
}

export interface DeleteShopResponse {
  message: string;
}
