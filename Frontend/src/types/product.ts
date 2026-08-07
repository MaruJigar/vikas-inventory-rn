/** Mirrors the backend Product/Category entities (Backend/src/product). */

export interface Category {
  id: string;
  name: string;
}

export interface Manufacturer {
  id: string;
  /** Canonical backend field (Manufacturer entity). */
  company_name?: string;
  name?: string;
  business_name?: string;
}

/** POST /v1/products — distributor creates their own product. */
export interface CreateProductPayload {
  product_source: 'DISTRIBUTOR_CREATED';
  distributor_id: string;
  external_manufacturer_name: string;
  name: string;
  mrp: number;
  gst_percent?: number;
  sku?: string;
  /** HSN tax code — backend caps it at 20 chars and trims it. */
  hsn_code?: string;
  unit?: string;
  description?: string;
  /** A product has exactly one category (backend single `category_id` FK). */
  category_id?: string;
  product_image_url?: string;
}

/**
 * PUT /v1/products/:id. `external_manufacturer_name` and the category field are
 * sent but the backend currently strips them (whitelist) — it must add them to
 * UpdateProductDto to persist.
 */
export interface UpdateProductPayload {
  name?: string;
  external_manufacturer_name?: string;
  mrp?: number;
  gst_percent?: number;
  sku?: string;
  hsn_code?: string;
  unit?: string;
  description?: string;
  category_id?: string;
  product_image_url?: string;
}

export interface Product {
  id: string;
  product_source: 'MANUFACTURER_CREATED' | 'DISTRIBUTOR_CREATED';
  name: string;
  sku: string | null;
  /** HSN tax code (backend `hsn_code`, varchar(20), nullable). */
  hsn_code: string | null;
  unit: string | null;
  description: string | null;
  product_image_url: string | null;
  /** Numeric columns arrive as strings over JSON — coerce before maths. */
  mrp: number | string;
  gst_percent: number | string;
  distributor_discount_percent: number | string;
  special_discount_percent: number | string;
  external_manufacturer_name: string | null;
  is_active: boolean;
  category: Category | null;
  manufacturer: Manufacturer | null;
}
