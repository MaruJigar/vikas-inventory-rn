/** Mirrors the backend Product/Category entities (Backend/src/product). */

export interface Category {
  id: string;
  name: string;
}

export interface Manufacturer {
  id: string;
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
