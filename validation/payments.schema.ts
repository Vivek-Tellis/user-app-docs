/**
 * Payments Schemas
 * Validation schemas for payment processing, orders, and transactions
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  moneyAmountSchema,
  currencySchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Payment Method Enum
// ============================================================================

export const paymentMethodEnum = z.enum([
  'card',
  'cash',
  'gift_card',
  'membership',
  'pay_later',
]);

export const paymentStatusEnum = z.enum(['pending', 'succeeded', 'failed', 'refunded']);

// ============================================================================
// Create Payment Order
// ============================================================================

export const createOrderRequestSchema = z.object({
  amount: moneyAmountSchema,
  currency: currencySchema,
  booking_id: idSchema.optional(),
  gift_card_id: idSchema.optional(),
  membership_id: idSchema.optional(),
  type: z.enum(['booking', 'gift_card', 'membership', 'package']),
});

export const createOrderResponseSchema = apiResponseSchema(
  z.object({
    order_id: nonEmptyStringSchema,
    client_secret: nonEmptyStringSchema,
    amount: moneyAmountSchema,
    currency: currencySchema,
  })
);

// ============================================================================
// Create Payment Session (Stripe Checkout)
// ============================================================================

export const createSessionResponseSchema = apiResponseSchema(
  z.object({
    session_id: nonEmptyStringSchema,
    url: z.string().url(),
  })
);

// ============================================================================
// Update Payment Status
// ============================================================================

export const updatePaymentStatusRequestSchema = z.object({
  payment_intent_id: nonEmptyStringSchema,
  status: paymentStatusEnum,
  booking_id: idSchema.optional(),
  gift_card_id: idSchema.optional(),
  membership_id: idSchema.optional(),
});

export const updatePaymentStatusResponseSchema = apiResponseSchema(
  z.object({
    payment_id: idSchema,
    booking_id: idSchema.optional(),
    gift_card_id: idSchema.optional(),
    membership_id: idSchema.optional(),
    message: nonEmptyStringSchema,
  })
);

// ============================================================================
// Saved Card Schema
// ============================================================================

export const savedCardSchema = z.object({
  id: nonEmptyStringSchema,
  brand: z.string(),
  last4: z.string().length(4),
  exp_month: z.number().int().min(1).max(12),
  exp_year: z.number().int().min(2020),
  is_default: z.boolean(),
});

export const savedCardsResponseSchema = apiResponseSchema(
  z.array(savedCardSchema)
);

// ============================================================================
// Stripe Payment Intent
// ============================================================================

export const stripePaymentIntentSchema = z.object({
  id: nonEmptyStringSchema,
  amount: moneyAmountSchema,
  currency: currencySchema,
  status: paymentStatusEnum,
  client_secret: nonEmptyStringSchema,
  payment_method: z.string().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type PaymentMethod = z.infer<typeof paymentMethodEnum>;
export type PaymentStatus = z.infer<typeof paymentStatusEnum>;
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;
export type UpdatePaymentStatusRequest = z.infer<typeof updatePaymentStatusRequestSchema>;
export type SavedCard = z.infer<typeof savedCardSchema>;
export type StripePaymentIntent = z.infer<typeof stripePaymentIntentSchema>;
