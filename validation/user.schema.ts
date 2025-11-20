/**
 * User Profile & Account Schemas
 * Validation schemas for user profile management and account operations
 */

import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  nonEmptyStringSchema,
  idSchema,
  apiResponseSchema,
} from './common.schema';
import { userSchema } from './auth.schema';

// ============================================================================
// Profile Management
// ============================================================================

/**
 * Edit customer profile request
 */
export const editCustomerRequestSchema = z.object({
  id: idSchema,
  name: nonEmptyStringSchema.min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema,
  profile_image: z.instanceof(File).optional(),
});

export const editCustomerResponseSchema = apiResponseSchema(
  z.object({
    customer: userSchema,
  })
);

/**
 * Get current user profile
 */
export const getCurrentUserResponseSchema = apiResponseSchema(userSchema);

/**
 * Delete user account
 */
export const deleteCustomerRequestSchema = z.object({
  customer_id: idSchema,
});

export const deleteCustomerResponseSchema = apiResponseSchema(
  z.object({
    message: z.string(),
  })
);

// ============================================================================
// Notification Settings
// ============================================================================

export const notificationSettingsRequestSchema = z.object({
  customer_id: idSchema,
  type: z.string(),
  status: z.string(),
});

export const notificationSettingsResponseSchema = apiResponseSchema(
  z.object({
    message: z.string(),
  })
);

// ============================================================================
// App Content (Policies)
// ============================================================================

/**
 * Content types: 1 = Privacy Policy, 2 = Terms of Use, 3 = Refund Policy, 4 = Deposit Policy
 */
export const appContentTypeSchema = z.enum(['1', '2', '3', '4']);

export const appContentResponseSchema = apiResponseSchema(
  z.object({
    content: z.string(),
    type: z.number().int().min(1).max(4),
    last_updated: z.string().optional(),
  })
);

// ============================================================================
// Developer Feedback
// ============================================================================

export const developerFeedbackRequestSchema = z.object({
  customer_id: idSchema,
  customer_name: nonEmptyStringSchema.min(2),
  rating: z.number().min(1).max(5),
  review: nonEmptyStringSchema.min(10, 'Review must be at least 10 characters'),
});

export const developerFeedbackResponseSchema = apiResponseSchema(
  z.object({
    feedback_id: idSchema,
    message: z.string(),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type EditCustomerRequest = z.infer<typeof editCustomerRequestSchema>;
export type DeleteCustomerRequest = z.infer<typeof deleteCustomerRequestSchema>;
export type NotificationSettingsRequest = z.infer<typeof notificationSettingsRequestSchema>;
export type AppContentType = z.infer<typeof appContentTypeSchema>;
export type DeveloperFeedbackRequest = z.infer<typeof developerFeedbackRequestSchema>;
