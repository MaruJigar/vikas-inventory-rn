export interface ProductDto {
  id: string;
  name: string;
  sku?: string;
  unit?: string;
  description?: string;
  product_image_url?: string;
  mrp: number;
  gst_percent?: number;
  distributor_discount_percent?: number;
  special_discount_percent?: number;
  product_source: 'MANUFACTURER_CREATED' | 'DISTRIBUTOR_CREATED';
  manufacturer_id?: string;
  distributor_id?: string;
  external_manufacturer_name?: string;
  category_id?: string;
}

export interface CreateProductDto {
  product_source: 'MANUFACTURER_CREATED' | 'DISTRIBUTOR_CREATED';
  manufacturer_id?: string;
  distributor_id?: string;
  external_manufacturer_name?: string;
  category_id?: string;
  name: string;
  sku?: string;
  unit?: string;
  description?: string;
  product_image_url?: string;
  mrp: number;
  gst_percent?: number;
  distributor_discount_percent?: number;
  special_discount_percent?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;
