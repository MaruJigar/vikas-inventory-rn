/** Mirrors the backend Shop entity + shop DTOs (Backend/src/shop). */

export interface Shop {
  id: string;
  distributor_id: string;
  name: string;
  owner_name: string | null;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  gst_number: string | null;
  verification_photo_url: string | null;
  verification_status: string;
  last_visit_at: string | null;
  last_order_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** POST /v1/shops */
export interface CreateShopPayload {
  name: string;
  owner_name?: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  gst_number?: string;
  latitude: number;
  longitude: number;
  /** Acknowledge a detected duplicate to bypass the block. */
  duplicate_bypass?: { matched_shop_id: string; match_type: string };
}

/** POST /v1/shops/check-duplicate */
export interface CheckDuplicatePayload {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
}

/** A single match returned by the duplicate check (empty array = no match). */
export interface DuplicateMatch {
  shop: Shop;
  match_type: 'PHONE' | 'LOCATION' | 'NAME';
  match_score: number;
}

/** A picked image ready to upload as multipart form-data. */
export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}
