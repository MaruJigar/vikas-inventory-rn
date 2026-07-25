import { z } from 'zod';

/** Error messages are i18n KEYS — rendered via `t(error.message)`.
 * Distributor profile: only the business name is required; the rest are
 * optional free-text (email must be valid when provided). */
export const editProfileSchema = z.object({
  business_name: z.string().trim().min(1, 'validation.required'),
  owner_name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .email('validation.email')
    .or(z.literal('')),
  gst_number: z.string().trim().optional(),
  address: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
});
export type EditProfileForm = z.infer<typeof editProfileSchema>;
