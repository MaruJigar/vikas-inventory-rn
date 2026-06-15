import * as z from 'zod';

export const CreateProductSchema = z.object({
  product_source: z.enum(['MANUFACTURER_CREATED', 'DISTRIBUTOR_CREATED']),
  manufacturer_id: z.string().uuid().optional(),
  distributor_id: z.string().uuid().optional(),
  external_manufacturer_name: z.string().min(1, 'External manufacturer name is required').optional(),
  category_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
  sku: z.string().max(100).optional(),
  unit: z.string().max(50).optional(),
  description: z.string().optional(),
  product_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  mrp: z.coerce.number().min(0, 'MRP must be positive'),
  gst_percent: z.coerce.number().min(0).max(100).optional(),
  distributor_discount_percent: z.coerce.number().min(0).max(100).optional(),
  special_discount_percent: z.coerce.number().min(0).max(100).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(150),
  parent_id: z.string().uuid().optional(),
});

export type CreateProductFormValues = z.infer<typeof CreateProductSchema>;
export type UpdateProductFormValues = z.infer<typeof UpdateProductSchema>;
export type CreateCategoryFormValues = z.infer<typeof CreateCategorySchema>;
