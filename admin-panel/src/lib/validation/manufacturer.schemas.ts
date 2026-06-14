import { z } from 'zod';

export const createManufacturerSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  contact_person: z.string().max(150).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(150).optional().or(z.literal('')),
  gst_number: z.string().max(50).optional().or(z.literal('')),
});

export type CreateManufacturerValues = z.infer<typeof createManufacturerSchema>;

export const updateManufacturerSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200).optional(),
  contact_person: z.string().max(150).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(150).optional().or(z.literal('')),
  gst_number: z.string().max(50).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
});

export type UpdateManufacturerValues = z.infer<typeof updateManufacturerSchema>;
