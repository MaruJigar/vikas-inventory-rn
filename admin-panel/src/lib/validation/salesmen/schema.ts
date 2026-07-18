import { z } from 'zod';

export const createSalesmanSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(150, 'Full name is too long'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required').max(30, 'Phone is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  distributor_id: z.string().uuid('Invalid distributor ID format').optional().or(z.literal('')),
  state_id: z.string().min(1, 'State is required'),
  state: z.string().optional().or(z.literal('')),
  city_id: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
}).superRefine((data) => {
  if (data.state_id && !data.city_id) {
    // Note: The user requested city to be optional. So we don't strictly require city if state is selected.
    // If we wanted to require city, we would do it here. 
  }
});

export const updateSalesmanSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(150, 'Full name is too long').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(30, 'Phone is too long').optional().or(z.literal('')),
  state_id: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  city_id: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
});

export type CreateSalesmanInput = z.infer<typeof createSalesmanSchema>;
export type UpdateSalesmanInput = z.infer<typeof updateSalesmanSchema>;
