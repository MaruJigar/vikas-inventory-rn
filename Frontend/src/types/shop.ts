/** Mirrors the backend Shop entity + shop DTOs (Backend/src/shop). */

export interface Shop {
  id: string;
  distributor_id: string;
  name: string;
  owner_name: string | null;
  phone: string;
  address: string;
  /** Denormalised city/state names (populated from the picked dropdown). */
  city_name: string | null;
  state_name: string | null;
  city_id: string | null;
  state_id: string | null;
  maps_link: string | null;
  gst_number: string | null;
  verification_photo_url: string | null;
  verification_status: string;
  last_visit_at: string | null;
  last_order_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * POST /v1/shops.
 * The backend stores `city_name`/`state_name` from the free-text `city`/`state`
 * fields, and keeps `city_id`/`state_id` as the relations — so we send both the
 * picked IDs and their names.
 */
export interface CreateShopPayload {
  name: string;
  owner_name?: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  city_id?: string;
  state_id?: string;
  maps_link?: string;
  gst_number?: string;
  /** Acknowledge a detected duplicate to bypass the block. */
  duplicate_bypass?: { matched_shop_id: string; match_type: string };
}

/** POST /v1/shops/check-duplicate */
export interface CheckDuplicatePayload {
  name: string;
  phone: string;
  city_id?: string;
  state_id?: string;
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
