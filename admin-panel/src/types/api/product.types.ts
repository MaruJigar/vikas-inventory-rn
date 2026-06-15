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

export interface CategoryDto {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  parent_id?: string;
}

export interface PricingHistoryDto {
  id: string;
  product_id: string;
  old_mrp: number;
  new_mrp: number;
  old_distributor_discount_percent: number;
  new_distributor_discount_percent: number;
  old_special_discount_percent: number;
  new_special_discount_percent: number;
  changed_by_user_id: string;
  changed_by_user_name: string;
  created_at: string;
}
