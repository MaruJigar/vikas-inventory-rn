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

export const forgotSchema = z.object({
  email_or_phone: z.string().trim().min(1, 'validation.emailOrPhone'),
});
export type ForgotForm = z.infer<typeof forgotSchema>;
