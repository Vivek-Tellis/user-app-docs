/**
 * Salon & Location Schemas
 * Validation schemas for salon information, locations, and business data
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  urlSchema,
  phoneSchema,
  emailSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Location Schema
// ============================================================================

export const locationSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  address: nonEmptyStringSchema,
  phone: phoneSchema,
  is_default: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const locationListResponseSchema = apiResponseSchema(
  z.array(locationSchema)
);

// ============================================================================
// Salon Color Theme
// ============================================================================

export const colorThemeSchema = z.object({
  light: z.object({
    primary_color: z.string(),
    secondary_color: z.string(),
    background_color: z.string(),
  }),
  dark: z.object({
    primary_color: z.string(),
    secondary_color: z.string(),
    background_color: z.string(),
  }),
  gradients: z.object({
    primary: z.string(),
    secondary: z.string(),
  }),
});

export const colorThemeResponseSchema = apiResponseSchema(colorThemeSchema);

// ============================================================================
// About Gallery
// ============================================================================

export const aboutGallerySchema = z.object({
  about: z.string(),
  gallery: z.array(urlSchema),
  working_hours: z.record(z.string()),
  contact: z.object({
    address: nonEmptyStringSchema,
    phone: phoneSchema,
    email: emailSchema,
  }),
});

export const aboutGalleryResponseSchema = apiResponseSchema(aboutGallerySchema);

// ============================================================================
// App Slider
// ============================================================================

export const sliderItemSchema = z.object({
  id: idSchema,
  image: urlSchema,
  title: z.string().optional(),
  subtitle: z.string().optional(),
  link: urlSchema.optional(),
});

export const sliderResponseSchema = apiResponseSchema(
  z.array(sliderItemSchema)
);

// ============================================================================
// Review Settings
// ============================================================================

export const reviewSettingsSchema = z.object({
  google_review_link: urlSchema.optional(),
  facebook_review_link: urlSchema.optional(),
  enable_google_reviews: z.boolean(),
  enable_facebook_reviews: z.boolean(),
});

export const reviewSettingsResponseSchema = apiResponseSchema(reviewSettingsSchema);

// ============================================================================
// Cancellation Policy
// ============================================================================

export const cancellationPolicySchema = z.object({
  policy_text: z.string(),
  cancellation_window_hours: z.number().int().nonnegative(),
  refund_percentage: z.number().min(0).max(100),
});

export const cancellationPolicyResponseSchema = apiResponseSchema(
  cancellationPolicySchema
);

// ============================================================================
// Type Exports
// ============================================================================

export type Location = z.infer<typeof locationSchema>;
export type ColorTheme = z.infer<typeof colorThemeSchema>;
export type AboutGallery = z.infer<typeof aboutGallerySchema>;
export type SliderItem = z.infer<typeof sliderItemSchema>;
export type ReviewSettings = z.infer<typeof reviewSettingsSchema>;
export type CancellationPolicy = z.infer<typeof cancellationPolicySchema>;
