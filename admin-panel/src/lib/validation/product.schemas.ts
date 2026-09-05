import { z } from 'zod';
export const productSchema = z.object({
  name: z.string(),
  mrp: z.number().min(0),
  product_source: z.enum(['MANUFACTURER_CREATED', 'DISTRIBUTOR_CREATED']),
});
