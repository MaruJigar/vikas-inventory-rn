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
  verification_photo_url: string;
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
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
}
