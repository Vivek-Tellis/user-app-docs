/**
 * Services & Categories Schemas
 * Validation schemas for salon services, categories, and add-ons
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  urlSchema,
  moneyAmountSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Service Category Schema
// ============================================================================

export const serviceCategorySchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  image: urlSchema,
  service_count: z.number().int().nonnegative(),
});

export const categoriesByLocationRequestSchema = z.object({
  location_id: idSchema,
});

export const categoriesByLocationResponseSchema = apiResponseSchema(
  z.array(serviceCategorySchema)
);

// ============================================================================
// Service Add-on Schema
// ============================================================================

export const serviceAddonSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  price: moneyAmountSchema,
  description: z.string().optional(),
});

// ============================================================================
// Service Schema
// ============================================================================

export const serviceSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  description: z.string().optional(),
  price: moneyAmountSchema,
  duration: z.number().int().positive(), // in minutes
  image: urlSchema.optional(),
  category_id: idSchema.optional(),
  category_name: z.string().optional(),
  add_ons: z.array(serviceAddonSchema).optional(),
});

// ============================================================================
// Get Services by Category
// ============================================================================

export const serviceByCategoryRequestSchema = z.object({
  location_id: idSchema,
  category_id: idSchema,
});

export const serviceByCategoryResponseSchema = apiResponseSchema(
  z.array(serviceSchema)
);

// ============================================================================
// Get Services by Location
// ============================================================================

export const servicesByLocationRequestSchema = z.object({
  location_id: idSchema,
});

export const servicesByLocationResponseSchema = apiResponseSchema(
  z.array(serviceSchema)
);

// ============================================================================
// Get Service Add-ons
// ============================================================================

export const serviceAddonsRequestSchema = z.object({
  services: z.array(idSchema).min(1, 'At least one service required'),
});

export const serviceAddonsResponseSchema = apiResponseSchema(
  z.object({
    required_addons: z.array(serviceAddonSchema),
    optional_addons: z.array(serviceAddonSchema),
  })
);

// ============================================================================
// Get Finish Add-ons
// ============================================================================

export const finishAddonsRequestSchema = z.object({
  services: z.array(idSchema).min(1),
});

export const finishAddonsResponseSchema = apiResponseSchema(
  z.array(serviceAddonSchema)
);

// ============================================================================
// Type Exports
// ============================================================================

export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
export type ServiceAddon = z.infer<typeof serviceAddonSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type CategoriesByLocationRequest = z.infer<typeof categoriesByLocationRequestSchema>;
export type ServiceByCategoryRequest = z.infer<typeof serviceByCategoryRequestSchema>;
export type ServicesByLocationRequest = z.infer<typeof servicesByLocationRequestSchema>;
export type ServiceAddonsRequest = z.infer<typeof serviceAddonsRequestSchema>;
export type FinishAddonsRequest = z.infer<typeof finishAddonsRequestSchema>;
