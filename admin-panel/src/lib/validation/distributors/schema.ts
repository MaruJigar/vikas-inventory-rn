import * as z from 'zod';

export const createDistributorSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  owner_name: z.string().min(1, 'Owner name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gst_number: z.union([z.literal(''), z.string()]).optional(),
  address: z.union([z.literal(''), z.string()]).optional(),
  city: z.union([z.literal(''), z.string()]).optional(),
  state: z.union([z.literal(''), z.string()]).optional(),
  country: z.union([z.literal(''), z.string()]).optional(),
  pincode: z.union([z.literal(''), z.string()]).optional(),
  manufacturer_ids: z.array(z.string()).min(1, 'Please select at least one manufacturer'),
});

export const updateDistributorSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  owner_name: z.string().min(1, 'Owner name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  gst_number: z.union([z.literal(''), z.string()]).optional(),
  address: z.union([z.literal(''), z.string()]).optional(),
  city: z.union([z.literal(''), z.string()]).optional(),
  state: z.union([z.literal(''), z.string()]).optional(),
  country: z.union([z.literal(''), z.string()]).optional(),
  pincode: z.union([z.literal(''), z.string()]).optional(),
  is_active: z.boolean().optional(),
  manufacturer_ids: z.array(z.string()).min(1, 'Please select at least one manufacturer'),
});

export type CreateDistributorFormValues = z.infer<typeof createDistributorSchema>;
export type UpdateDistributorFormValues = z.infer<typeof updateDistributorSchema>;
