import { z } from 'zod';
export const orderProductSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(0.01),
  itemDiscountType: z.enum(['NONE', 'PERCENTAGE', 'FLAT']).optional(),
  itemDiscountValue: z.number().min(0).optional(),
});
export const createOrderSchema = z.object({
  visitId: z.string().uuid(),
  shopId: z.string().uuid(),
  products: z.array(orderProductSchema),
});
