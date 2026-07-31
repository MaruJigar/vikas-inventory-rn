import * as z from 'zod';

export const createManufacturerSchema = z.object({
  company_name: z.string().min(2, { message: 'Company name must be at least 2 characters' }).max(200, { message: 'Company name cannot exceed 200 characters' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  contact_person: z.string().max(150, { message: 'Contact person cannot exceed 150 characters' }).optional(),
  phone: z.string().min(1, { message: 'Phone number is required' }).max(30, { message: 'Phone cannot exceed 30 characters' }),
  email: z.union([z.literal(''), z.string().email({ message: 'Invalid email format' }).max(150, { message: 'Email cannot exceed 150 characters' })]).optional(),
  gst_number: z.string().max(50, { message: 'GST number cannot exceed 50 characters' }).optional(),
  address: z.string().optional(),
  city: z.string().max(100, { message: 'City cannot exceed 100 characters' }).optional(),
  state: z.string().max(100, { message: 'State cannot exceed 100 characters' }).optional(),
  country: z.string().max(100, { message: 'Country cannot exceed 100 characters' }).optional(),
  pincode: z.string().max(10, { message: 'Pincode cannot exceed 10 characters' }).optional(),
});

export type CreateManufacturerValues = z.infer<typeof createManufacturerSchema>;

export const updateManufacturerSchema = z.object({
  company_name: z.string().min(2, { message: 'Company name must be at least 2 characters' }).max(200, { message: 'Company name cannot exceed 200 characters' }),
  contact_person: z.string().max(150, { message: 'Contact person cannot exceed 150 characters' }).optional(),
  phone: z.string().min(1, { message: 'Phone number is required' }).max(30, { message: 'Phone cannot exceed 30 characters' }),
  email: z.union([z.literal(''), z.string().email({ message: 'Invalid email format' }).max(150, { message: 'Email cannot exceed 150 characters' })]).optional(),
  gst_number: z.string().max(50, { message: 'GST number cannot exceed 50 characters' }).optional(),
  address: z.string().optional(),
  city: z.string().max(100, { message: 'City cannot exceed 100 characters' }).optional(),
  state: z.string().max(100, { message: 'State cannot exceed 100 characters' }).optional(),
  country: z.string().max(100, { message: 'Country cannot exceed 100 characters' }).optional(),
  pincode: z.string().max(10, { message: 'Pincode cannot exceed 10 characters' }).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateManufacturerValues = z.infer<typeof updateManufacturerSchema>;
