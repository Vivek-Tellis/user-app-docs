/**
 * Staff Schemas
 * Validation schemas for salon staff members
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  urlSchema,
  ratingSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Staff Schema
// ============================================================================

export const staffSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  image: urlSchema.optional(),
  designation: z.string().optional(),
  rating: ratingSchema.optional(),
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  review_count: z.number().int().nonnegative().optional(),
  experience: z.string().optional(),
  working_hours: z
    .record(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    )
    .optional(),
});

// ============================================================================
// Get Staff by Location
// ============================================================================

export const staffByLocationRequestSchema = z.object({
  location_id: idSchema,
});

export const staffByLocationResponseSchema = apiResponseSchema(
  z.array(staffSchema)
);

// ============================================================================
// Get Staff by Service
// ============================================================================

export const staffByServiceRequestSchema = z.object({
  services: z.string(), // comma-separated service IDs
  location: z.string(),
});

export const staffByServiceItemSchema = z.object({
  staff_id: idSchema,
  staff_name: nonEmptyStringSchema,
  service_id: idSchema,
  availability: z.boolean(),
});

export const staffByServiceResponseSchema = apiResponseSchema(
  z.array(staffByServiceItemSchema)
);

// ============================================================================
// Get Staff Details
// ============================================================================

export const staffDetailsRequestSchema = z.object({
  staff_id: idSchema,
});

export const staffDetailsResponseSchema = apiResponseSchema(staffSchema);

// ============================================================================
// Type Exports
// ============================================================================

export type Staff = z.infer<typeof staffSchema>;
export type StaffByLocationRequest = z.infer<typeof staffByLocationRequestSchema>;
export type StaffByServiceRequest = z.infer<typeof staffByServiceRequestSchema>;
export type StaffByServiceItem = z.infer<typeof staffByServiceItemSchema>;
export type StaffDetailsRequest = z.infer<typeof staffDetailsRequestSchema>;
