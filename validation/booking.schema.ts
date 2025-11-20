/**
 * Booking Schemas
 * Validation schemas for the booking flow and related operations
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  dateStringSchema,
  timeStringSchema,
  moneyAmountSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Booking Settings
// ============================================================================

export const bookingSettingsSchema = z.object({
  deposit_enable: z.boolean(),
  deposit_percentage: z.number().min(0).max(100),
  pay_later_enable: z.boolean(),
  save_card_enable: z.boolean(),
  max_booking_days_advance: z.number().int().positive(),
  cancellation_policy: z.string(),
});

export const bookingSettingsResponseSchema = apiResponseSchema(bookingSettingsSchema);

// ============================================================================
// Time Slot Schema
// ============================================================================

export const timeSlotSchema = z.object({
  time: timeStringSchema,
  available: z.boolean(),
  staff_id: idSchema.optional(),
});

// ============================================================================
// Get Available Slots
// ============================================================================

export const getSlotRequestSchema = z.object({
  location_id: idSchema,
  start_date: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'Date must be YYYY/MM/DD format'),
  end_date: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, 'Date must be YYYY/MM/DD format'),
  service_pricing_options: z.array(idSchema).min(1, 'At least one service required'),
  staff: z.array(idSchema).optional(),
});

export const getSlotResponseSchema = apiResponseSchema(
  z.record(z.array(timeSlotSchema))
);

// ============================================================================
// Save Booking
// ============================================================================

export const bookingServiceItemSchema = z.object({
  service_id: idSchema,
  pricing_option_id: idSchema,
  addons: z.array(idSchema).optional(),
  staff_id: idSchema.optional(),
});

export const saveBookingRequestSchema = z.object({
  location_id: idSchema,
  services: z.array(bookingServiceItemSchema).min(1, 'At least one service required'),
  appointment_date: dateStringSchema,
  start_time: timeStringSchema,
  total_amount: moneyAmountSchema,
  payment_type: z.enum(['full', 'deposit', 'pay_later']),
  customer_notes: z.string().optional(),
});

export const saveBookingResponseSchema = apiResponseSchema(
  z.object({
    booking_id: idSchema,
    appointment_number: nonEmptyStringSchema,
    status: z.enum(['pending', 'confirmed']),
    total_amount: moneyAmountSchema,
  })
);

// ============================================================================
// Update Booking
// ============================================================================

export const updateBookingRequestSchema = saveBookingRequestSchema.extend({
  booking_id: idSchema,
});

export const updateBookingResponseSchema = saveBookingResponseSchema;

// ============================================================================
// Type Exports
// ============================================================================

export type BookingSettings = z.infer<typeof bookingSettingsSchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type GetSlotRequest = z.infer<typeof getSlotRequestSchema>;
export type BookingServiceItem = z.infer<typeof bookingServiceItemSchema>;
export type SaveBookingRequest = z.infer<typeof saveBookingRequestSchema>;
export type SaveBookingResponse = z.infer<typeof saveBookingResponseSchema>;
export type UpdateBookingRequest = z.infer<typeof updateBookingRequestSchema>;
