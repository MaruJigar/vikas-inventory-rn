import { z } from 'zod';
export const adjustInventorySchema = z.object({
  distributor_id: z.string().uuid(),
  product_id: z.string().uuid(),
  movement_type: z.enum(['OPENING_STOCK', 'STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_CORRECTED', 'MANUAL_ADJUSTMENT']),
  quantity_change: z.number(),
  reason: z.string().optional(),
});
