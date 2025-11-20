/**
 * Memberships Schemas
 * Validation schemas for membership purchases and management
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
// Membership Schema
// ============================================================================

export const membershipSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  price: moneyAmountSchema,
  description: z.string().optional(),
  benefits: z.array(z.string()),
  duration: z.string(), // e.g., "1 month", "3 months", "1 year"
  image: urlSchema.optional(),
});

export const membershipListResponseSchema = apiResponseSchema(
  z.array(membershipSchema)
);

// ============================================================================
// Purchased Membership Schema
// ============================================================================

export const purchasedMembershipSchema = z.object({
  id: idSchema,
  membership_name: nonEmptyStringSchema,
  purchase_date: dateStringSchema,
  validity: z.string(),
  expiry_date: dateStringSchema.optional(),
  status: z.enum(['active', 'expired', 'used']),
  benefits: z.array(z.string()),
  membership_card: urlSchema.optional(),
});

export const getPurchasedMembershipsRequestSchema = z.object({
  email: emailSchema,
});

export const getPurchasedMembershipsResponseSchema = apiResponseSchema(
  z.array(purchasedMembershipSchema)
);

// ============================================================================
// Type Exports
// ============================================================================

export type Membership = z.infer<typeof membershipSchema>;
export type PurchasedMembership = z.infer<typeof purchasedMembershipSchema>;
export type GetPurchasedMembershipsRequest = z.infer<typeof getPurchasedMembershipsRequestSchema>;
