import { z } from 'zod';

export const LoginSchema = z.object({
  email_or_phone: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterDistributorSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  business_name: z.string().min(1, 'Business name is required'),
  gst_number: z.string().optional(),
});

export const RegisterSalesmanSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  distributor_id: z.string().uuid('Please select a valid distributor'),
});
