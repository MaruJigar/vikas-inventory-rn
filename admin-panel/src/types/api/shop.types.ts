export interface DuplicateBypassDto {
  matched_shop_id: string;
  match_type: string;
}

export interface CreateShopDto {
  name: string;
  owner_name?: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  gst_number?: string;
  latitude: number;
  longitude: number;
  verification_photo_url?: string | null;
  duplicate_bypass?: DuplicateBypassDto;
}

export type UpdateShopDto = Partial<CreateShopDto>;

export interface CheckDuplicateDto {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
}

export interface ShopDto {
  id: string;
  distributor_id: string;
  created_by_user_id?: string;
  created_by_salesman_id?: string;
  name: string;
  owner_name?: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  gst_number?: string;
  latitude: number;
  longitude: number;
  verification_photo_url?: string | null;
  verification_status: string;
  last_visit_at?: string;
  last_order_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
