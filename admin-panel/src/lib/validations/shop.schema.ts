import { z } from 'zod';

export const createShopBaseSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  owner_name: z.string().optional().nullable(),
  city_id: z.string().optional(),
  state_id: z.string().min(1, 'State is required'),
  gst_number: z.string().optional().nullable(),
  maps_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  distributor_id: z.string().optional(),
});

export const createShopSchema = createShopBaseSchema.superRefine((data, ctx) => {
  if (data.state_id && !data.city_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'City is required',
      path: ['city_id'],
    });
  }
});

export const updateShopBaseSchema = createShopBaseSchema;
export const updateShopSchema = createShopSchema;

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
