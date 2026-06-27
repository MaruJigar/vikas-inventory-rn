import { z } from 'zod';

/**
 * Error messages are i18n KEYS (not literal text) so screens can render
 * `t(error.message)` and stay reactive to language switches.
 */

const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;

export const loginSchema = z.object({
  email_or_phone: z.string().trim().min(1, 'validation.emailOrPhone'),
  password: z.string().min(6, 'validation.passwordMin'),
});
export type LoginForm = z.infer<typeof loginSchema>;

const baseRegister = {
  full_name: z.string().trim().min(1, 'validation.required'),
  email: z.string().trim().email('validation.email'),
  phone: z.string().trim().regex(phoneRegex, 'validation.phone'),
  password: z.string().min(6, 'validation.passwordMin'),
};

export const registerDistributorSchema = z.object({
  ...baseRegister,
  business_name: z.string().trim().min(1, 'validation.required'),
  gst_number: z.string().trim().regex(gstRegex, 'validation.gst'),
});
export type RegisterDistributorForm = z.infer<typeof registerDistributorSchema>;

export const forgotSchema = z.object({
  email_or_phone: z.string().trim().min(1, 'validation.emailOrPhone'),
});
export type ForgotForm = z.infer<typeof forgotSchema>;
