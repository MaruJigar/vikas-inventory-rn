import { z } from 'zod';

export const fulfillOrderSchema = z.object({
  notes: z.string().optional(),
});

export const partialDispatchItemSchema = z.object({
  orderItemId: z.string(),
  dispatchQuantity: z.number().min(0),
});

export const partialDispatchSchema = z.object({
  items: z.array(partialDispatchItemSchema),
  notes: z.string().optional(),
});

export const partialDeliverItemSchema = z.object({
  orderItemId: z.string(),
  deliverQuantity: z.number().min(0),
});

export const partialDeliverSchema = z.object({
  items: z.array(partialDeliverItemSchema),
  notes: z.string().optional(),
});
