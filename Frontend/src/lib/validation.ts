import { z } from 'zod';

/** Shared field validators reused across auth/shop forms. */

// Indian mobile: 10 digits, optional +91 / leading 0.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91|0)?[6-9]\d{9}$/, 'Enter a valid 10-digit phone number');

export const emailSchema = z.string().trim().email('Enter a valid email');

// GSTIN: 15 chars, standard format.
export const gstSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Enter a valid 15-character GST number',
  );

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

/** Login accepts either an email or a phone number. */
export const emailOrPhoneSchema = z
  .string()
  .trim()
  .min(1, 'Email or phone is required');
