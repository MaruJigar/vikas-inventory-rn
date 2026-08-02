import { z } from 'zod';

/**
 * Error messages are i18n KEYS (not literal text) so screens can render
 * `t(error.message)` and stay reactive to language switches.
 */

export const loginSchema = z.object({
  email_or_phone: z.string().trim().min(1, 'validation.emailOrPhone'),
  password: z.string().min(6, 'validation.passwordMin'),
});
export type LoginForm = z.infer<typeof loginSchema>;

const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Distributor self-signup. Mirrors `RegisterDistributorDto`, whose
 * `manufacturer_ids` is a required array — at least one must be picked.
 */
export const registerDistributorSchema = z.object({
  full_name: z.string().trim().min(1, 'validation.required'),
  email: z.string().trim().toLowerCase().email('validation.email'),
  phone: z.string().trim().regex(phoneRegex, 'validation.phone'),
  password: z.string().min(6, 'validation.passwordMin'),
  business_name: z.string().trim().min(1, 'validation.required'),
  manufacturer_ids: z.array(z.string()).min(1, 'validation.required'),
  gst_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(gstRegex, 'validation.gst')
    .optional()
    .or(z.literal('')),
  city: z.string().trim().optional(),
});
export type RegisterDistributorForm = z.infer<typeof registerDistributorSchema>;

// Backend resets by EMAIL (sends a reset link), so this flow needs an email.
export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'validation.required').email('validation.email'),
});
export type ForgotForm = z.infer<typeof forgotSchema>;
