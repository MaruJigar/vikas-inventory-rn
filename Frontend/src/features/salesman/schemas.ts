import { z } from 'zod';

/** Error messages are i18n KEYS — rendered via `t(error.message)`. */

const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;

export const addSalesmanSchema = z.object({
  full_name: z.string().trim().min(1, 'validation.required'),
  email: z.string().trim().email('validation.email'),
  phone: z.string().trim().regex(phoneRegex, 'validation.phone'),
  password: z.string().min(6, 'validation.passwordMin'),
});
export type AddSalesmanForm = z.infer<typeof addSalesmanSchema>;

/** Edit omits password (backend update accepts name/phone/email only). */
export const editSalesmanSchema = z.object({
  full_name: z.string().trim().min(1, 'validation.required'),
  email: z.string().trim().email('validation.email'),
  phone: z.string().trim().regex(phoneRegex, 'validation.phone'),
});
export type EditSalesmanForm = z.infer<typeof editSalesmanSchema>;
