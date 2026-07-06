import { z } from 'zod';

export const createSalesmanSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(150, 'Full name is too long'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required').max(30, 'Phone is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  distributor_id: z.string().min(1, 'Distributor selection is required').uuid('Invalid distributor ID format'),
});

export const updateSalesmanSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(150, 'Full name is too long').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(30, 'Phone is too long').optional().or(z.literal('')),
});

export type CreateSalesmanInput = z.infer<typeof createSalesmanSchema>;
export type UpdateSalesmanInput = z.infer<typeof updateSalesmanSchema>;
