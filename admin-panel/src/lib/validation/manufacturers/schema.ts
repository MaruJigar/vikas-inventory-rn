import * as z from 'zod';

export const createManufacturerSchema = z.object({
  company_name: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(''), z.string().email()]).optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

export type CreateManufacturerValues = z.infer<typeof createManufacturerSchema>;

export const updateManufacturerSchema = z.object({
  company_name: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(''), z.string().email()]).optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateManufacturerValues = z.infer<typeof updateManufacturerSchema>;
