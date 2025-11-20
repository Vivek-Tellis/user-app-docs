/**
 * Common Validation Schemas
 * Reusable schemas shared across multiple domains
 */

import { z } from 'zod';

// ============================================================================
// Common Primitives
// ============================================================================

/**
 * Email validation with descriptive error message
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .trim()
  .toLowerCase();

/**
 * Phone number validation (10-15 digits)
 */
export const phoneSchema = z
  .string()
  .regex(/^\d{10,15}$/, 'Phone number must be 10-15 digits')
  .trim();

/**
 * Non-empty string with trimming
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'This field is required')
  .trim();

/**
 * Positive integer ID
 */
export const idSchema = z.number().int().positive();

/**
 * URL validation
 */
export const urlSchema = z.string().url('Please enter a valid URL');

/**
 * Date string in YYYY-MM-DD format
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

/**
 * Time string in HH:MM format (24-hour)
 */
export const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format');

/**
 * Date string with ISO 8601 format
 */
export const isoDateStringSchema = z.string().datetime();

// ============================================================================
// Common Objects
// ============================================================================

/**
 * Standard API response wrapper
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.boolean(),
    message: z.string().optional(),
    data: dataSchema,
  });

/**
 * API error response
 */
export const apiErrorSchema = z.object({
  status: z.literal(false),
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
});

/**
 * Pagination metadata
 */
export const paginationSchema = z.object({
  current_page: z.number().int().positive(),
  total_pages: z.number().int().nonnegative(),
  total_count: z.number().int().nonnegative(),
  per_page: z.number().int().positive(),
});

/**
 * Paginated response wrapper
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.boolean(),
    data: z.array(dataSchema),
    pagination: paginationSchema,
  });

/**
 * Image object
 */
export const imageSchema = z.object({
  id: idSchema.optional(),
  url: urlSchema,
  alt: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

/**
 * Address object
 */
export const addressSchema = z.object({
  street: nonEmptyStringSchema,
  city: nonEmptyStringSchema,
  state: nonEmptyStringSchema,
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: nonEmptyStringSchema.default('US'),
});

/**
 * Money amount (in cents or smallest currency unit)
 */
export const moneyAmountSchema = z.number().nonnegative();

/**
 * Currency code (ISO 4217)
 */
export const currencySchema = z.string().length(3).toUpperCase();

/**
 * Price object
 */
export const priceSchema = z.object({
  amount: moneyAmountSchema,
  currency: currencySchema,
  formatted: z.string().optional(),
});

// ============================================================================
// Common Enums
// ============================================================================

/**
 * Status enum
 */
export const statusEnum = z.enum(['active', 'inactive', 'pending']);

/**
 * Gender enum
 */
export const genderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

/**
 * Rating (1-5 stars)
 */
export const ratingSchema = z.number().min(1).max(5);

/**
 * Percentage (0-100)
 */
export const percentageSchema = z.number().min(0).max(100);

// ============================================================================
// Custom Transformations
// ============================================================================

/**
 * Transform string to date
 */
export const stringToDateSchema = z.string().transform((str) => new Date(str));

/**
 * Transform empty string to null
 */
export const emptyStringToNullSchema = z
  .string()
  .transform((val) => (val === '' ? null : val));

/**
 * Transform string to number
 */
export const stringToNumberSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .pipe(z.number());

// ============================================================================
// Utility Schemas
// ============================================================================

/**
 * Nullable schema helper
 */
export const nullable = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.null()]);

/**
 * Optional with default helper
 */
export const withDefault = <T extends z.ZodTypeAny>(schema: T, defaultValue: z.infer<T>) =>
  schema.optional().default(defaultValue);

// ============================================================================
// Type Exports
// ============================================================================

export type ApiResponse<T> = {
  status: boolean;
  message?: string;
  data: T;
};

export type ApiError = z.infer<typeof apiErrorSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type Image = z.infer<typeof imageSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Price = z.infer<typeof priceSchema>;
