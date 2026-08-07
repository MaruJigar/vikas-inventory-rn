import { z } from 'zod';

/** Error messages are i18n KEYS — rendered via `t(error.message)`. */

const priceRegex = /^\d+(\.\d{1,2})?$/;
const percentRegex = /^\d{1,3}(\.\d{1,2})?$/;

export const addProductSchema = z.object({
  name: z.string().trim().min(1, 'validation.required'),
  external_manufacturer_name: z.string().trim().min(1, 'validation.required'),
  mrp: z.string().trim().regex(priceRegex, 'validation.price'),
  gst_percent: z
    .string()
    .trim()
    .regex(percentRegex, 'validation.percent')
    .optional()
    .or(z.literal('')),
  unit: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  /** Backend column is varchar(20) with a MaxLength(20) guard — match it here
   * so an over-long code fails in the form rather than as a 400. */
  hsn_code: z.string().trim().max(20, 'validation.maxLength20').optional(),
  description: z.string().trim().optional(),
});

export type AddProductForm = z.infer<typeof addProductSchema>;
