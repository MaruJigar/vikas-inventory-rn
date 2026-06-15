import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const createShopSchema = z.object({
  shop_name: z.string().min(1, 'Shop name is required'),
  owner_name: z.string().optional(),
  mobile_number: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must not exceed 15 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.preprocess(
    (val) => Number(val),
    z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90')
  ),
  longitude: z.preprocess(
    (val) => Number(val),
    z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180')
  ),
  verification_image: z
    .any()
    .refine((file) => file instanceof File, 'Verification image is required')
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE,
      'Max file size is 5MB.'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

export type CreateShopFormValues = z.infer<typeof createShopSchema>;
