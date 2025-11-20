/**
 * Gift Cards Schemas
 * Validation schemas for gift card purchases and management
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  emailSchema,
  phoneSchema,
  moneyAmountSchema,
  urlSchema,
  dateStringSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Gift Card Schema
// ============================================================================

export const giftCardSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  denominations: z.array(moneyAmountSchema),
  image: urlSchema,
  description: z.string().optional(),
});

export const giftCardListResponseSchema = apiResponseSchema(
  z.array(giftCardSchema)
);

// ============================================================================
// Occasion Schema
// ============================================================================

export const occasionSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema,
  image: urlSchema.optional(),
});

export const occasionsResponseSchema = apiResponseSchema(
  z.array(occasionSchema)
);

// ============================================================================
// Create Gift Card Sale
// ============================================================================

export const createGiftCardSaleRequestSchema = z.object({
  gift_card_id: idSchema,
  amount: moneyAmountSchema,
  recipient_name: nonEmptyStringSchema.min(2),
  recipient_email: emailSchema,
  recipient_phone: phoneSchema.optional(),
  sender_name: nonEmptyStringSchema.min(2),
  message: z.string().max(500).optional(),
  occasion_id: idSchema.optional(),
  delivery_date: dateStringSchema.optional(),
});

export const createGiftCardSaleResponseSchema = apiResponseSchema(
  z.object({
    sale_id: idSchema,
    gift_card_number: nonEmptyStringSchema,
    amount: moneyAmountSchema,
    status: z.enum(['pending', 'completed']),
    delivery_date: dateStringSchema.optional(),
  })
);

// ============================================================================
// Purchased Gift Card Schema
// ============================================================================

export const purchasedGiftCardSchema = z.object({
  id: idSchema,
  gift_card_number: nonEmptyStringSchema,
  amount: moneyAmountSchema,
  purchase_date: dateStringSchema,
  expiry_date: dateStringSchema.optional(),
  status: z.enum(['active', 'expired', 'used']),
  recipient_name: nonEmptyStringSchema,
  sender_name: nonEmptyStringSchema,
  message: z.string().optional(),
  remaining_balance: moneyAmountSchema.optional(),
});

export const getPurchasedGiftCardsRequestSchema = z.object({
  email: emailSchema,
});

export const getPurchasedGiftCardsResponseSchema = apiResponseSchema(
  z.array(purchasedGiftCardSchema)
);

// ============================================================================
// Type Exports
// ============================================================================

export type GiftCard = z.infer<typeof giftCardSchema>;
export type Occasion = z.infer<typeof occasionSchema>;
export type CreateGiftCardSaleRequest = z.infer<typeof createGiftCardSaleRequestSchema>;
export type PurchasedGiftCard = z.infer<typeof purchasedGiftCardSchema>;
export type GetPurchasedGiftCardsRequest = z.infer<typeof getPurchasedGiftCardsRequestSchema>;
