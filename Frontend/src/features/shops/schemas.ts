import { z } from 'zod';

/** Error messages are i18n KEYS — rendered via `t(error.message)`. */

const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const addShopSchema = z.object({
  name: z.string().trim().min(1, 'validation.required'),
  owner_name: z.string().trim().optional(),
  phone: z.string().trim().regex(phoneRegex, 'validation.phone'),
  address: z.string().trim().min(1, 'validation.required'),
  // State/City are picked from dropdowns (their names are sent alongside the ids).
  state_id: z.string().min(1, 'validation.required'),
  city_id: z.string().min(1, 'validation.required'),
  maps_link: z
    .string()
    .trim()
    .url('validation.url')
    .optional()
    .or(z.literal('')),
  gst_number: z
    .string()
    .trim()
    .regex(gstRegex, 'validation.gst')
    .optional()
    .or(z.literal('')),
});

export type AddShopForm = z.infer<typeof addShopSchema>;
