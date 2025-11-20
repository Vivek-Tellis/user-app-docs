/**
 * Packages Schemas
 * Validation schemas for service package purchases and management
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  emailSchema,
  moneyAmountSchema,
  urlSchema,
  dateStringSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Package Schema
// ============================================================================

export const packageSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  price: moneyAmountSchema,
  description: z.string().optional(),
  services: z.array(z.string()),
  validity: z.string(), // e.g., "30 days", "90 days"
  image: urlSchema.optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
});

export const packageListResponseSchema = apiResponseSchema(
  z.array(packageSchema)
);

// ============================================================================
// Purchased Package Schema
// ============================================================================

export const purchasedPackageSchema = z.object({
  id: idSchema,
  package_name: nonEmptyStringSchema,
  purchase_date: dateStringSchema,
  validity: z.string(),
  expiry_date: dateStringSchema.optional(),
  status: z.enum(['active', 'expired', 'used']),
  services: z.array(z.string()),
  remaining_services: z.number().int().nonnegative().optional(),
  total_services: z.number().int().positive().optional(),
});

export const getPurchasedPackagesRequestSchema = z.object({
  email: emailSchema,
});

export const getPurchasedPackagesResponseSchema = apiResponseSchema(
  z.array(purchasedPackageSchema)
);

// ============================================================================
// Type Exports
// ============================================================================

export type Package = z.infer<typeof packageSchema>;
export type PurchasedPackage = z.infer<typeof purchasedPackageSchema>;
export type GetPurchasedPackagesRequest = z.infer<typeof getPurchasedPackagesRequestSchema>;
