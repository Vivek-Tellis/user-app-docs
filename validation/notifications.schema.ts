/**
 * Notifications Schemas
 * Validation schemas for push notifications and in-app notifications
 */

import { z } from 'zod';
import {
  idSchema,
  nonEmptyStringSchema,
  apiResponseSchema,
} from './common.schema';

// ============================================================================
// Notification Type Enum
// ============================================================================

export const notificationTypeEnum = z.enum(['appointment', 'promotion', 'system', 'reminder']);

// ============================================================================
// Notification Schema
// ============================================================================

export const notificationSchema = z.object({
  id: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  message: nonEmptyStringSchema,
  type: notificationTypeEnum,
  read: z.boolean(),
  created_at: z.string(),
  data: z
    .object({
      appointment_id: idSchema.optional(),
      booking_id: idSchema.optional(),
      link: z.string().url().optional(),
      action: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// Get All Notifications
// ============================================================================

export const getNotificationsResponseSchema = apiResponseSchema(
  z.array(notificationSchema)
);

// ============================================================================
// Notification Count
// ============================================================================

export const notificationCountResponseSchema = apiResponseSchema(
  z.object({
    unread_count: z.number().int().nonnegative(),
  })
);

// ============================================================================
// Mark as Read
// ============================================================================

export const markAsReadResponseSchema = apiResponseSchema(
  z.object({
    message: nonEmptyStringSchema,
  })
);

// ============================================================================
// Mark All as Read
// ============================================================================

export const markAllAsReadResponseSchema = apiResponseSchema(
  z.object({
    message: nonEmptyStringSchema,
    total_marked: z.number().int().nonnegative(),
  })
);

// ============================================================================
// Push Notification Token
// ============================================================================

export const registerPushTokenRequestSchema = z.object({
  token: nonEmptyStringSchema,
  device_type: z.enum(['ios', 'android']),
  device_id: nonEmptyStringSchema,
});

export const registerPushTokenResponseSchema = apiResponseSchema(
  z.object({
    message: nonEmptyStringSchema,
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type NotificationType = z.infer<typeof notificationTypeEnum>;
export type Notification = z.infer<typeof notificationSchema>;
export type RegisterPushTokenRequest = z.infer<typeof registerPushTokenRequestSchema>;
